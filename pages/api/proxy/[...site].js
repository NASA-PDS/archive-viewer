import { createSolrProxy } from 'services/solrProxy'
import runtime from 'services/runtime'
import { getSolrBaseUrl } from 'services/solr'

const localSolr = getSolrBaseUrl()

const rewriteWeb = (path) => {
    // console.log('Rewriting web request to ' + path)
    let cleanPath = path.replace('/api/proxy/web', '')
    let [collection, parameters] = cleanPath.split('?')
    return `${collection}/select?${parameters}`
}
const rewriteCore = (path) => {
    // console.log('Rewriting backup core request to ' + path)
    let parameters = path.replace(/^\/api\/proxy\/(?:core|heartbeat)/, '')
    return `/pds-alias/select${parameters}`
}

const coreProxy = createSolrProxy(localSolr, rewriteCore)
const webProxy = createSolrProxy(localSolr, rewriteWeb)

async function handler(req, res) {
    const site = Array.isArray(req.query.site) ? req.query.site[0] : req.query.site
    switch(site) {
        case 'internal': handleMessage(req.query.message); return res.status(200).send('OK')
        case 'web': return webProxy(req, res)
        case 'heartbeat': return coreProxy(req, res)
        case 'core': return coreProxy(req, res)
        default: return res.status(400).json({ message: 'Invalid proxy request site' })
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
