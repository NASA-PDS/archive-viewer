/**
 * Per-process limit for concurrent Solr/axios requests to avoid overloading the index during SSG.
 * Next spawns many workers; each has its own cap. Set SOLR_MAX_CONCURRENCY in the build environment.
 *
 * - SOLR_MAX_CONCURRENCY: max in-flight requests in this process (0 = no limit, default in browser)
 * - During `next build` (NEXT_PHASE=phase-production-build), default is 3 if unset
 */

function isNodeProductionBuild() {
    if(typeof window !== 'undefined') {
        return false
    }
    return process.env.NEXT_PHASE === 'phase-production-build'
}

export function getSolrHttpConcurrencyCap() {
    if(typeof window !== 'undefined') {
        return 0
    }
    const raw = process.env.SOLR_MAX_CONCURRENCY
    if(raw !== undefined && raw !== '') {
        const n = Number.parseInt(raw, 10)
        if(!Number.isFinite(n) || n < 0) {
            return 0
        }
        return n
    }
    if(isNodeProductionBuild()) {
        return 3
    }
    return 0
}

/**
 * @param {number} n
 * @returns {(fn: () => Promise<any>) => Promise<any>}
 */
function pLimit(n) {
    if(!n) {
        return (fn) => fn()
    }
    const queue = []
    let active = 0
    return (fn) => new Promise((resolve, reject) => {
        const go = () => {
            if(active >= n) {
                queue.push(go)
                return
            }
            active += 1
            fn()
                .then(
                    (v) => {
                        active -= 1
                        resolve(v)
                        const next = queue.shift()
                        if(next) {
                            next()
                        }
                    },
                    (e) => {
                        active -= 1
                        reject(e)
                        const next = queue.shift()
                        if(next) {
                            next()
                        }
                    }
                )
        }
        go()
    })
}

let _limiter = null
let _lastCap = -1

function getLimiter() {
    const cap = getSolrHttpConcurrencyCap() || 0
    if(!_limiter || _lastCap !== cap) {
        _lastCap = cap
        _limiter = pLimit(cap)
    }
    return _limiter
}

/**
 * @template T
 * @param {() => Promise<T>} fn
 * @returns {Promise<T>}
 */
export function runLimitedSolrRequest(fn) {
    const cap = getSolrHttpConcurrencyCap() || 0
    if(!cap) {
        return fn()
    }
    return getLimiter()(fn)
}
