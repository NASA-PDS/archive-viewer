import { serviceAvailable } from 'api/common'
import { createProxyMiddleware } from 'http-proxy-middleware'
import runtime from 'services/runtime'

const localSolr = process.env.NEXT_PUBLIC_SUPPLEMENTAL_SOLR || 'https://sbnpds4.psi.edu/solr'
const remoteSolr = process.env.NEXT_PUBLIC_CORE_SOLR || 'https://pds.nasa.gov/services/search'

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
    // check in on backup mode
    if(runtime.backupMode) { 

        // if we're in backup mode, spin off a request to see if service is restored
        serviceAvailable().then(
            yes => {
                console.log('PROXY: Registry service now available, disabling backup mode 🎉')
                runtime.setBackupMode(false)
            },
            no => {
                console.log('Registry service still unavailable')
            }
        )
    }

    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                serviceAvailable().then(
                    yes => {
                        console.log('PROXY: Registry service available. Error was ' + props.error.message)
                    },
                    no => {
                        console.error(no)
                        console.log('PROXY: Registry service unavailable, switching to backup mode 🚨🚨🚨')
                        // Engineering node registry not available. Switch to backup mode
                        runtime.setBackupMode(true)
                    }
                )
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
const rewriteBackupCore = (path) => {
    // console.log('Rewriting backup core request to ' + path)
    let parameters = path.replace('/api/proxy/core', '')
    return `/pds-alias/select${parameters}`
}
const rewriteCore = (path) => {
    // console.log('Rewriting core request to ' + path)
    let parameters = path.replace('/api/proxy/core', '').replace('/api/proxy/heartbeat', '')
    return `/search${parameters}`
}

const coreMiddleware = createProxyMiddleware({ target: remoteSolr, changeOrigin: true, pathRewrite: rewriteCore })
const backupCoreMiddleware = createProxyMiddleware({ target: localSolr, changeOrigin: true, pathRewrite: rewriteBackupCore })
const webMiddleware = createProxyMiddleware({ target: localSolr, changeOrigin: true, pathRewrite: rewriteWeb })

async function handler(req, res) {
    // console.log('Backup mode: ' + runtime.backupMode)
    const site = req.query.site[0]
    switch(site) {
        case 'internal': handleMessage(req.query.message); return res.status(200).send('OK')
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

function handleMessage(message) {
    // console.log('Received internal message: ' + message)
    switch(message) {
        case runtime.ENABLE_BACKUP_MODE_MESSAGE: runtime.setBackupMode(true, true); break
        case runtime.DISABLE_BACKUP_MODE_MESSAGE: runtime.setBackupMode(false, true); break
    }
}

export default handler

export const config = {
    runtime: 'nodejs',
}