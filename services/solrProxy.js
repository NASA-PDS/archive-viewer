import httpProxy from 'http-proxy'

// Routes are selected explicitly by the API handler; no glob matcher is needed.
export function createSolrProxy(target, rewritePath) {
    const proxy = httpProxy.createProxyServer({ target, changeOrigin: true })

    return (req, res) => new Promise(resolve => {
        const complete = () => {
            res.off('finish', complete)
            res.off('close', complete)
            resolve()
        }
        res.once('finish', complete)
        res.once('close', complete)
        req.url = rewritePath(req.url)
        const authorization = 'Basic ' + Buffer.from(`${process.env.SOLR_USER}:${process.env.SOLR_PASS}`).toString('base64')
        proxy.web(req, res, { headers: { authorization } }, () => {
            if (res.destroyed || res.writableEnded) return complete()
            if (res.headersSent) return res.destroy()
            res.writeHead(502, { 'Content-Type': 'text/plain' })
            res.end('Unable to reach upstream service')
        })
    })
}
