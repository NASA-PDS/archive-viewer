import { createProxyMiddleware } from 'http-proxy-middleware'

const localSolr = process.env.NEXT_PUBLIC_SUPPLEMENTAL_SOLR || 'https://sbnpds4.psi.edu/solr'
const remoteSolr = process.env.NEXT_PUBLIC_CORE_SOLR || 'https://pds-gamma.jpl.nasa.gov/services/search'

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
const coreMiddleware = createProxyMiddleware({ target: remoteSolr, changeOrigin: true, pathRewrite: {'^/api/proxy/core' : ''} })
const webMiddleware = createProxyMiddleware({ target: localSolr, changeOrigin: true, pathRewrite: {'^/api/proxy/web' : ''} })

async function handler(req, res) {
    if(req.query.site[0] === 'core') {
        return runMiddleware(req, res, coreMiddleware)
    } else if(req.query.site[0] === 'web') {
        return runMiddleware(req, res, webMiddleware)
    }
}

export default handler