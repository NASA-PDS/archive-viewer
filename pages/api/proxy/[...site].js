import { serviceAvailable } from 'api/common'
import { createProxyMiddleware } from 'http-proxy-middleware'
import runtime from 'services/runtime'

const localSolr = process.env.NEXT_PUBLIC_SUPPLEMENTAL_SOLR || 'https://sbnpds4.psi.edu/solr'

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
    // console.log('Rewriting web request to ' + path)
    let cleanPath = path.replace('/api/proxy/web', '')
    let [collection, parameters] = cleanPath.split('?')
    return `${collection}/select?${parameters}`
}
const rewriteCore = (path) => {
    // console.log('Rewriting backup core request to ' + path)
    let parameters = path.replace('/api/proxy/core', '')
    return `/pds-alias/select${parameters}`
}

const coreMiddleware = createProxyMiddleware({ target: localSolr, changeOrigin: true, on: { proxyReq: addAuthorization }, pathRewrite: rewriteCore })
const webMiddleware = createProxyMiddleware({ target: localSolr, changeOrigin: true, on: { proxyReq: addAuthorization }, pathRewrite: rewriteWeb })

async function handler(req, res) {
    const site = req.query.site[0]
    switch(site) {
        case 'internal': handleMessage(req.query.message); return res.status(200).send('OK')
        case 'web': return runMiddleware(req, res, webMiddleware)
        case 'heartbeat': return runMiddleware(req, res, coreMiddleware)
        case 'core': return runMiddleware(req, res, coreMiddleware)
        default: res.status(400).send("Invalid proxy request to site " + site)
    }

}

function addAuthorization(proxyReq, req, res) {
    // add basic authorization header to request
    let auth = 'Basic ' + Buffer.from(process.env.NEXT_PUBLIC_SOLR_USER + ':' + process.env.NEXT_PUBLIC_SOLR_PASS).toString('base64')
    proxyReq.setHeader('Authorization', auth)
}

function handleMessage(message) {
    // console.log('Received internal message: ' + message)
    switch(message) {
        case runtime.ENABLE_BACKUP_MODE_MESSAGE: runtime.setBackupMode(true, true); break
        case runtime.DISABLE_BACKUP_MODE_MESSAGE: runtime.setBackupMode(false, true); break
    }
}

export default handler