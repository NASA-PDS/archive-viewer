import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { once } from 'node:events'
import test from 'node:test'
import vm from 'node:vm'
import { createSolrProxy } from '../services/solrProxy.js'

async function listen(t, handler) {
    const server = createServer(handler)
    server.listen(0, '127.0.0.1')
    await once(server, 'listening')
    t.after(() => new Promise(resolve => {
        server.close(resolve)
        server.closeAllConnections()
    }))
    return { server, url: `http://127.0.0.1:${server.address().port}` }
}

async function loadHandler(target) {
    const source = await readFile(new URL('../pages/api/proxy/[...site].js', import.meta.url), 'utf8')
    const module = new vm.SourceTextModule(source)
    await module.link(specifier => {
        const exports = {
            'services/solrProxy': { createSolrProxy },
            'services/solr': { getSolrBaseUrl: () => target },
            'services/runtime': { default: {} },
        }[specifier]
        return new vm.SyntheticModule(Object.keys(exports), function () {
            for (const [name, value] of Object.entries(exports)) this.setExport(name, value)
        })
    })
    await module.evaluate()
    return module.namespace.default
}

test('Solr proxy preserves routing, credentials, status, and response headers', async t => {
    const upstream = await listen(t, (req, res) => {
        res.writeHead(201, { 'Content-Type': 'application/json', 'X-Upstream': 'solr' })
        res.end(JSON.stringify({ url: req.url, host: req.headers.host, authorization: req.headers.authorization }))
    })
    const handler = await loadHandler(`${upstream.url}/solr`)
    const frontend = await listen(t, (req, res) => {
        req.query = { site: req.url.split('/')[3].split('?')[0] }
        handler(req, res)
    })
    for (const [path, expected] of [
        ['/api/proxy/core?q=title%3AMars&rows=2', '/solr/pds-alias/select?q=title%3AMars&rows=2'],
        ['/api/proxy/heartbeat?q=*%3A*', '/solr/pds-alias/select?q=*%3A*'],
        ['/api/proxy/web/mission?q=identifier%3Aexample', '/solr/mission/select?q=identifier%3Aexample'],
    ]) {
        const response = await fetch(`${frontend.url}${path}`, { headers: { Authorization: 'Bearer client-token' } })
        assert.equal(response.status, 201)
        assert.equal(response.headers.get('x-upstream'), 'solr')
        const body = await response.json()
        assert.equal(body.url, expected)
        assert.equal(body.host, new URL(upstream.url).host)
        assert.equal(body.authorization, 'Basic ' + Buffer.from(`${process.env.SOLR_USER}:${process.env.SOLR_PASS}`).toString('base64'))
        assert.notEqual(body.authorization, 'Bearer client-token')
    }
})

test('Solr proxy returns a generic 502 when the upstream refuses a connection', async t => {
    const upstream = await listen(t, () => {})
    await new Promise(resolve => upstream.server.close(resolve))
    const proxy = createSolrProxy(upstream.url, () => '/select')
    const frontend = await listen(t, (req, res) => proxy(req, res))
    const response = await fetch(`${frontend.url}/api/proxy/core`)
    assert.equal(response.status, 502)
    assert.equal(await response.text(), 'Unable to reach upstream service')
})

test('Solr proxy completes its promise after the response finishes', async t => {
    const upstream = await listen(t, (_req, res) => res.end('OK'))
    const proxy = createSolrProxy(upstream.url, () => '/select')
    let completed
    const done = new Promise(resolve => { completed = resolve })
    const frontend = await listen(t, async (req, res) => {
        await proxy(req, res)
        completed()
    })
    const response = await fetch(frontend.url)
    assert.equal(await response.text(), 'OK')
    await done
})
