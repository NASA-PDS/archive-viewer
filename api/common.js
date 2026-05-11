import web from 'axios';
import desolrize from 'services/desolrize.js'
import LID from 'services/LogicalIdentifier.js'
import router from 'api/router.js'
import { runLimitedSolrRequest } from 'services/solrHttpLimit.js'
import { types, resolveType, resolveContext, contexts } from 'services/pages.js'
import { stitchWithTools } from './tools';

const defaultFetchSize = 50
const defaultParameters = () => { return {
    wt: 'json',
    rows: defaultFetchSize,
    start: 0
}}

function getSolrHttpTimeoutMs() {
    const raw = process.env.SOLR_HTTP_TIMEOUT_MS
    if(raw !== undefined && raw !== '') {
        const n = Number.parseInt(raw, 10)
        if(Number.isFinite(n) && n > 0) {
            return n
        }
    }
    return 10000
}

function getHttpMaxAttempts() {
    if(typeof window !== 'undefined') {
        return 3
    }
    if(process.env.NEXT_PHASE === 'phase-production-build') {
        return 1
    }
    return 3
}

function isRetriableRequestError(err) {
    if(!err) {
        return false
    }
    const c = err.code
    if(c === 'ECONNRESET' || c === 'ECONNABORTED' || c === 'ETIMEDOUT' || c === 'EPIPE' || c === 'ECONNREFUSED' || c === 'ENOTFOUND') {
        return true
    }
    if(err.response && [429, 502, 503, 504].includes(err.response.status)) {
        return true
    }
    if(err.response == null && err.request) {
        return true
    }
    const msg = String(err.message || '').toLowerCase()
    if(msg.includes('socket hang up') || msg.includes('network error') || msg.includes('timeout')) {
        return true
    }
    return false
}

/**
 * Resolves the same as axios.get, with limited concurrency to Solr and optional retries.
 * Exported for build-time code paths (e.g. core Solr list) that use axios directly.
 */
export function axiosGetWithRetry(url, config) {
    return runLimitedSolrRequest(() => {
        const max = getHttpMaxAttempts()
        async function attempt(i) {
            return web.get(url, config).catch(err => {
                if(i >= max - 1 || !isRetriableRequestError(err)) {
                    return Promise.reject(err)
                }
                const waitMs = 150 * (2 ** i)
                return new Promise(r => setTimeout(r, waitMs)).then(() => attempt(i + 1))
            })
        }
        return attempt(0)
    })
}

function getServerAuthHeaders() {
    if(typeof window !== 'undefined') {
        return {}
    }
    const user = process.env.SOLR_USER
    const pass = process.env.SOLR_PASS
    if(!user || !pass) {
        return {}
    }
    return {
        Authorization: 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64')
    }
}

// Base-level solr fetch function, that all other functions will eventually call. 
// Recursively fetches all results for a particular Solr query
export function httpGet(endpoint, params, withCount, continuingFrom) {
    const paramsWithDefaultsApplied = Object.assign(defaultParameters(), params)
    continuingFrom = continuingFrom || []
    if(typeof window !== 'undefined') {
        const query = paramsWithDefaultsApplied?.q || null
        console.info('[runtime-fetch:httpGet]', { endpoint, query, rows: paramsWithDefaultsApplied?.rows, start: paramsWithDefaultsApplied?.start })
    }
    if(params.q === "") {
        // don't let poorly formed queries through
        return Promise.resolve([])
    }

    return new Promise((resolve, reject) => 
        axiosGetWithRetry(endpoint, {
            params: paramsWithDefaultsApplied,
            timeout: getSolrHttpTimeoutMs(),
            headers: getServerAuthHeaders()
        }).then(response => {
            let fromSolr = response.data
            
            if(!fromSolr || !fromSolr.response) {
                reject(new Error("Couldn't parse results"))
                return
            }

            let docsAvailable = parseInt(fromSolr.response.numFound)
            let currentPosition = parseInt(fromSolr.responseHeader.params.start)
            let docs = fromSolr.response.docs
            let numRemaining = docsAvailable - currentPosition - docs.length
            
            // if this is the only/last batch, desolrize it and return
            if (numRemaining === 0 || (!!params.rows && params.rows !== defaultFetchSize)) {
                let docs = [...continuingFrom, ...desolrize(fromSolr)]
                if(withCount === true) {
                    resolve({
                        count: docsAvailable,
                        docs
                    })
                } else {
                    resolve(docs)
                }
            }
            // otherwise, call the next batch and pass the resolve function down the line
            else {
                paramsWithDefaultsApplied.start = currentPosition + parseInt(paramsWithDefaultsApplied.rows)
                httpGet(endpoint, paramsWithDefaultsApplied, null, [...continuingFrom, ...desolrize(fromSolr)]).then(resolve, reject)
            }
        }, reject)
    )
}

export function httpGetIdentifiers(route, identifiers, extraFields) {
    if(!identifiers || identifiers.length === 0) return Promise.resolve([])
    let lids = identifiers.constructor === String ? [identifiers] : identifiers
    
    // if we have lots of identifiers, break it into multiple requests (recusrively!!)
    let requests = []
    if (lids.length > defaultFetchSize) {
        requests.push(httpGetIdentifiers(route, lids.slice(defaultFetchSize), extraFields))
        lids = lids.slice(0, defaultFetchSize)
    }

    let params = {
        q: lids.reduce((query, lid) => query + 'identifier:"' + new LID(lid).lid + '" ', ''),
        fl: 'identifier, title' + ( extraFields ? ', ' + extraFields.join(', ') : '')
    }
    requests.push(httpGet(route, params))
    return Promise.all(requests).then(results => results.flat())
}


export function initialLookup(identifier, pdsOnly) {
    let lid = new LID(identifier)
    return new Promise((resolve, reject) => {
        let params = {
            q: `identifier:"${lid.escapedLid}"`
        }
        httpGet(router.defaultCore, params).then(result => {
            if(!result || result.length === 0) {
                reject(new Error(`Nothing found with identifier ${lid.lid}`))
            }

            let doc = Object.assign({}, result[0]);
            if(!!lid.vid && lid.vid !== doc.version_id) {
                let error = new Error("Superseded version")
                error.superseded = doc
                reject(error)
            }
            
            // skip supplemental metadata if pdsOnly flag set
            if(pdsOnly) { resolve(doc); return}

            let supplementalRoute, attrname;
            switch (resolveType(doc)) {
                case types.INSTRUMENT: supplementalRoute = router.instrumentsWeb; attrname='instrument'; break;
                case types.MISSION: supplementalRoute = router.missionsWeb; attrname='mission'; break;
                case types.SPACECRAFT: supplementalRoute = router.spacecraftWeb; attrname='spacecraft'; break;
                case types.TARGET: supplementalRoute = router.targetsWeb; attrname='target'; break;
                case types.BUNDLE:
                case types.COLLECTION:
                case types.PDS3:
                    supplementalRoute = router.datasetWeb; attrname='dataset'; break;
                default:
                    supplementalRoute = null
            }

            if(!!supplementalRoute) {
                httpGet(supplementalRoute, {
                    q: `logical_identifier:("${lid.escaped}" OR "${lid.escapedLid}")`,
                    fl: `*`,
                }).then(result => {
                    if(result.length > 0) {
                        let matchingDoc = result[0]
                        if(result.length > 1) {
                            if(!!lid.vid) {
                                // find the document that matches the lidvid
                                matchingDoc = result.find(r => r.logical_identifier === lid.lidvid)
                            } else {
                                // find the document with the latest version ID
                                try {
                                    const sorted = result.sort((r1, r2) => {
                                        const vid1 = new LID(r1.logical_identifier).vid, vid2 = new LID(r2.logical_identifier).vid
                                        return parseFloat(vid2) - parseFloat(vid1)
                                    })
                                    matchingDoc = sorted[0]
                                } catch(err) {
                                    // just give up
                                    matchingDoc = {}
                                }
                            }
                        }
                        Object.assign(doc, matchingDoc)
                    }
                    resolve(doc)
                }).catch(error => {
                    console.log('Error getting supplemental data: ' + error)
                    // ignore the error, just pass on the doc from the core registry
                    resolve(doc)
                })
            } else {
                let error = new Error("Unsupported product type")
                error.product = doc
                reject(error)
            }
        }, error => {
            reject(error)
        })
    }).then(stitchWithTools)
}

export function httpGetRelated(initialQuery, route, knownLids) {
    return new Promise((resolve, reject) => {
        httpGet(route, initialQuery).then(results => {
            let foundLids = results.map(items => items.identifier)
            if(!knownLids || knownLids.length === 0 || arraysEquivalent(foundLids, knownLids)) {
                // if we have all the referenced items, just return them
                resolve(results)
            } else {
                // otherwise, perform another query to get the other 
                httpGetIdentifiers(route, knownLids).then(otherResults => {
                    // and combine them with the original list
                    let combined = [...results, ...otherResults]
                    resolve(combined.filter((item, index) => combined.findIndex(otherItem => item.identifier === otherItem.identifier) === index))
                }, reject)
            }
        }, reject)
    })
}

export function getMoreDatasetsForContext(missions, targets, parentContext) {
    const missionQuery = missions.map(mi => `investigation_ref:${new LID(mi.identifier).escapedLid}\\:\\:*`).join(' OR ')
    const targetQuery = targets.map(ta => `target_ref:${new LID(ta.identifier).escapedLid}\\:\\:*`).join(' OR ')
    let params = {
        q: `(product_class:"Product_Bundle" AND (${[missionQuery, targetQuery].filter(el => !!el).join(' OR ')}))`,
        fl: 'identifier, title, description, collection_ref, collection_type, citation_publication_year, observation_start_date_time, observation_start_date_time, primary_result_purpose'
    }
    return httpGet(router.datasetCore, params)
        .then(stitchWithWebFields(['display_name', 'tags', 'primary_context'], router.datasetWeb))
        .then(datasets => datasets.filter(bundle => {
                const bundleContext = resolveContext(bundle)
                // filter for things that are meant to appear on both More Data pages, or the parentContext's More Data page
                return [contexts.MISSIONANDTARGET, parentContext, contexts.MORE_DATA, contexts.UNKNOWN].includes(bundleContext)
            })
        )
        
}

function arraysEquivalent(arr1, arr2) {
    return arr1.length === arr2.length && arr1.every((el) => arr2.includes(el))
}

export function stitchWithInternalReferences(fieldName, route) {
    return (previousResult) => {
        if(!previousResult || previousResult.length === 0) return Promise.resolve([])

        const lids = previousResult.map(result => result[fieldName] || []).flat().map(lidvid => new LID(lidvid).lid)

        return new Promise((resolve, _ ) => {
            httpGetIdentifiers(router.defaultCore, lids).then(stitchWithWebFields(['display_name'], route)).then(internalReferences => {
                previousResult.forEach(result => {
                    result[fieldName] = (result[fieldName] || []).map(referenceLid => internalReferences.find(ref => new LID(ref.identifier).lid === new LID(referenceLid).lid ) || referenceLid)
                })
                resolve(previousResult)
            }, () => resolve(previousResult))
        })
    }
}

export function stitchWithWebFields(fields, route) {
    if(!fields.includes('logical_identifier')) { fields.push('logical_identifier')}
    return (previousResult) => {
        if(!previousResult || previousResult.length === 0) return Promise.resolve([])

        // for client side requests that are in pds-only mode, skip this step entirely
        if(typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('pdsOnly') === 'true') {
            return Promise.resolve(previousResult)
        }
            
        // if we have lots of identifiers, break it into multiple requests (recusrively!!)
        let requests = []
        if (previousResult.length > defaultFetchSize) {
            requests.push(stitchWithWebFields(fields, route)(previousResult.slice(defaultFetchSize)))
            previousResult = previousResult.slice(0, defaultFetchSize)
        }
        let identifiers = previousResult.map(doc => doc.identifier)
        
        let params = {
            q: identifiers.reduce((query, lid) => query + 'logical_identifier:"' + lid + '" ', ''),
            fl: fields.join()
        }

        requests.push(httpGet(route, params).then(webDocs => {
            let toReturn = []
            // combine documents by lid
            for (let coreDoc of previousResult ) {
                let consolidated = Object.assign({}, coreDoc)
                let corresponding = webDocs.find(webUIdoc => new LID(webUIdoc.logical_identifier).lid === new LID(coreDoc.identifier).lid)
                if(!!corresponding) {
                    toReturn.push(Object.assign(consolidated, corresponding))
                } else {
                    toReturn.push(consolidated)
                }
            }
            return toReturn
        }, err => {
            //ignore error, just pass original
            return previousResult
        }))
        return Promise.all(requests).then(results => results.flat())
    }
}

export function pds3Get(params) {

    let defaultParams = {
        fq: `facet_pds_model_version:"1,pds3" AND facet_type:"1,data_set"`,
        "f.facet_pds_model_version.facet.prefix": '2,pds3,',
        "f.facet_type.facet.prefix:": '2,data_set,',
        fl: 'identifier,title,resLocation',
        rows: 10
    }
    Object.assign(defaultParams, params)

    return httpGet(router.datasetCore, defaultParams, true)
}

//wrap the network call so that this function only ever has one instance running
let serviceCheckPromise
export function serviceAvailable() {

    const params = {
        q: '*:*',
        rows: 1
    }
    if(!serviceCheckPromise) {
        serviceCheckPromise = new Promise((resolve, reject) => {
            httpGet(router.heartbeat, params).then(results => {
                if(results.length > 0) resolve()
                else reject('Empty results')
            }, reject).finally(() => {
                serviceCheckPromise = undefined
            })
        })
    }
    return serviceCheckPromise
}

let internalMessagePromise
export function internalMessage(message) {
    if(!internalMessagePromise) {
        internalMessagePromise = new Promise((resolve, reject) => {
            web.get(router.internal, { params: {message}}).then(resolve, reject)
            .finally(() => {
                internalMessagePromise = undefined
            })
        })
    }
    return internalMessagePromise
}
