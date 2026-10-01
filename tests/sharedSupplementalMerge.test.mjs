import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import vm from 'node:vm'
import { createVersionedRecordLookup } from '../services/versionedRecords.js'

const lid = 'urn:nasa:pds:example:data'
const web = version => ({ logical_identifier: `${lid}::${version}`, display_name: `Display ${version}` })

// Exercise the complete common.js module, including httpGet and batching, with
// axios as the network boundary. Production modules keep their Next.js aliases.
async function loadCommonApi(get, browserSearch) {
    const context = vm.createContext({
        process: { env: {} }, console, setTimeout, URLSearchParams,
        ...(browserSearch === undefined ? {} : { window: { location: { search: browserSearch } } }),
    })
    const modules = new Map()
    function stub(name, exports) {
        modules.set(name, new vm.SyntheticModule(Object.keys(exports), function() {
            for(const [key, value] of Object.entries(exports)) this.setExport(key, value)
        }, { context }))
    }
    stub('axios', { default: { get } })
    stub('api/router.js', { default: {} })
    stub('services/pages.js', { types: {}, contexts: {}, resolveType: () => {}, resolveContext: () => {} })
    stub('./tools', { stitchWithTools: result => result })
    async function link(specifier) {
        const key = specifier === './LogicalIdentifier.js' ? 'services/LogicalIdentifier.js' : specifier
        if(!modules.has(key)) {
            const source = await readFile(new URL(`../${key}`, import.meta.url), 'utf8')
            const module = new vm.SourceTextModule(source, { context })
            modules.set(key, module)
            await module.link(link)
        }
        return modules.get(key)
    }
    const source = await readFile(new URL('../api/common.js', import.meta.url), 'utf8')
    const module = new vm.SourceTextModule(source, { context })
    await module.link(link)
    await module.evaluate()
    return module.namespace
}

function response(docs, config) {
    return { data: { responseHeader: { params: config.params }, response: { numFound: docs.length, docs } } }
}

for(const [label, core, versions, expected] of [
    ['specified core VID wins over a newer supplemental version', { identifier: lid, version_id: '1.1' }, ['1.0', '1.2', '1.1'], '1.1'],
    ['versioned identifier takes precedence over version_id', { identifier: `${lid}::1.1`, version_id: '1.2' }, ['1.0', '1.2', '1.1'], '1.1'],
    ['missing requested VID uses latest', { identifier: `${lid}::1.1` }, ['1.0', '1.9', '1.10'], '1.10'],
    ['no core VID uses latest', { identifier: lid }, ['1.0', '1.9', '1.10'], '1.10'],
    ['Solr array version_id is respected', { identifier: lid, version_id: ['1.1'] }, ['1.2', '1.1'], '1.1'],
]) {
    test(label, async () => {
        const calls = []
        const api = await loadCommonApi(async (route, config) => {
            calls.push({ route, config })
            return response(versions.map(web), config)
        })
        const snapshot = structuredClone(core)
        const [result] = await api.stitchWithWebFields(['display_name'], 'web')([core])
        assert.equal(result.display_name, `Display ${expected}`)
        assert.equal(result.identifier, core.identifier)
        assert.deepEqual(core, snapshot)
        assert.equal(calls.length, 1)
        assert.equal(calls[0].config.params.q, `logical_identifier:"${lid}" `)
        assert.equal(calls[0].config.params.fl, 'display_name,logical_identifier')
    })
}

test('missing supplemental data preserves core fields', async () => {
    const core = { identifier: lid, version_id: '1.1', title: 'Original' }
    const api = await loadCommonApi(async (_route, config) => response([], config))
    const [result] = await api.stitchWithWebFields(['display_name'], 'web')([core])
    assert.deepEqual(JSON.parse(JSON.stringify(result)), core)
})

test('failed supplemental request retains the original results', async () => {
    const core = [{ identifier: lid, title: 'Original' }]
    const api = await loadCommonApi(async () => { throw { response: { status: 400 } } })
    const result = await api.stitchWithWebFields(['display_name'], 'web')(core)
    assert.equal(result[0], core[0])
})

test('empty inputs and browser pdsOnly mode perform no requests', async () => {
    const api = await loadCommonApi(() => { throw new Error('Unexpected request') }, '?pdsOnly=true')
    const core = [{ identifier: lid }]
    assert.equal(await api.stitchWithWebFields(['display_name'], 'web')(core), core)
    assert.equal((await api.stitchWithWebFields(['display_name'], 'web')([])).length, 0)
})

test('51 core records retain two request batches and all results', async () => {
    const core = Array.from({ length: 51 }, (_, i) => ({ identifier: `${lid}_${i}`, version_id: '1.1' }))
    const calls = []
    const api = await loadCommonApi(async (_route, config) => {
        calls.push(config.params)
        const identifiers = [...config.params.q.matchAll(/logical_identifier:"([^"]+)"/g)].map(match => match[1])
        return response(identifiers.map(identifier => ({ logical_identifier: `${identifier}::1.1`, display_name: identifier })), config)
    })
    const result = await api.stitchWithWebFields(['display_name'], 'web')(core)
    assert.equal(calls.length, 2)
    assert.deepEqual(calls.map(call => [...call.q.matchAll(/logical_identifier:/g)].length).sort((a, b) => a - b), [1, 50])
    assert.equal(result.length, 51)
    assert.ok(result.every(record => record.display_name === record.identifier))
})

test('duplicate LIDs are fetched once and each row selects its own VID', async () => {
    let query
    const api = await loadCommonApi(async (_route, config) => {
        query = config.params.q
        return response([web('1.0'), web('1.1')], config)
    })
    const result = await api.stitchWithWebFields(['display_name'], 'web')([
        { identifier: lid, version_id: '1.0' }, { identifier: lid, version_id: '1.1' },
    ])
    assert.equal(query, `logical_identifier:"${lid}" `)
    assert.deepEqual(Array.from(result, row => row.display_name), ['Display 1.0', 'Display 1.1'])
})

test('latest supplemental selection includes existing pagination results', async () => {
    const docs = Array.from({ length: 51 }, (_, i) => web(`1.${i}`))
    const starts = []
    const api = await loadCommonApi(async (_route, config) => {
        const { start, rows } = config.params
        starts.push(start)
        return { data: {
            responseHeader: { params: config.params },
            response: { numFound: docs.length, docs: docs.slice(start, start + rows) },
        } }
    })
    const [result] = await api.stitchWithWebFields(['display_name'], 'web')([{ identifier: lid }])
    assert.equal(result.display_name, 'Display 1.50')
    assert.deepEqual(starts, [0, 50])
})

test('indexing parses each candidate once regardless of lookup count', () => {
    let reads = 0
    const docs = Array.from({ length: 500 }, (_, i) => ({
        get logical_identifier() { reads++; return `${lid}_${Math.floor(i / 10)}::1.${i % 10}` },
    }))
    const find = createVersionedRecordLookup(docs, 'logical_identifier')
    assert.equal(reads, 500)
    for(let i = 0; i < 1000; i++) assert.ok(find(`${lid}_${i % 50}::1.1`))
    assert.equal(reads, 500)
})
