import { createProxyMiddleware } from 'http-proxy-middleware'
import runtime from 'services/runtime'

const localSolr = process.env.NEXT_PUBLIC_SUPPLEMENTAL_SOLR || 'https://sbnpds4.psi.edu/solr'
const remoteSolr = process.env.NEXT_PUBLIC_CORE_SOLR || 'https://pds.nasa.gov/services/search'

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
            return reject(result)
            }

            return resolve(result)
        })
    })
}

const rewriteWeb = (path) => {
    let cleanPath = path.replace('/api/proxy/web', '')
    let [collection, parameters] = cleanPath.split('?')
    return `${collection}/select?${parameters}`
}
const rewriteBackupCore = (path) => {
    let parameters = path.replace('/api/proxy/core', '')
    return `/pds-alias/select${parameters}`
}
const rewriteCore = (path) => {
    let parameters = path.replace('/api/proxy/core', '').replace('/api/proxy/heartbeat', '')
    return `/search${parameters}`
}

const coreMiddleware = createProxyMiddleware({ target: remoteSolr, changeOrigin: true, pathRewrite: rewriteCore })
const backupCoreMiddleware = createProxyMiddleware({ target: localSolr, changeOrigin: true, pathRewrite: rewriteBackupCore })
const webMiddleware = createProxyMiddleware({ target: localSolr, changeOrigin: true, pathRewrite: rewriteWeb })

async function handler(req, res) {
    const site = req.query.site[0]
    switch(site) {
        // case 'web': res.status(503).send("Service unavailable")
        case 'web': return runMiddleware(req, res, webMiddleware)
        case 'heartbeat': return runMiddleware(req, res, coreMiddleware)
        case 'core': {
            return runtime.backupMode
                ? runMiddleware(req, res, backupCoreMiddleware)
                : runMiddleware(req, res, coreMiddleware)
        }
        default: res.status(400).send("Invalid proxy request to site " + site)
    }

}

export default handler