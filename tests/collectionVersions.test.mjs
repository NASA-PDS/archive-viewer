import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import vm from 'node:vm'
import { mergeVersionedRecords, selectVersionedRecord } from '../services/versionedRecords.js'

const lid = 'urn:nasa:pds:example:data'
const core = version => ({ identifier: lid, version_id: version, title: `Core ${version}` })
const web = version => ({ logical_identifier: `${lid}::${version}`, display_name: `Display ${version}` })

for(const [label, reference, coreVersions, webVersions, expectedCore, expectedWeb] of [
    ['exact versions beat newer records', `${lid}::1.1`, ['1.0', '1.2', '1.1'], ['1.0', '1.2', '1.1'], '1.1', '1.1'],
    ['missing core version falls back independently', `${lid}::1.1`, ['1.0', '1.2'], ['1.0', '1.1'], '1.2', '1.1'],
    ['missing supplemental version falls back independently', `${lid}::1.1`, ['1.0', '1.1'], ['1.0', '1.2'], '1.1', '1.2'],
    ['both missing versions fall back independently', `${lid}::1.1`, ['1.0', '1.3'], ['1.0', '1.2'], '1.3', '1.2'],
    ['unversioned references choose latest from each source', lid, ['1.0', '1.9', '1.10'], ['1.0', '1.11', '1.9'], '1.10', '1.11'],
    ['missing supplemental records preserve core', `${lid}::1.1`, ['1.0', '1.1'], [], '1.1', undefined],
]) {
    test(label, () => {
        const coreDocs = coreVersions.map(core)
        const webDocs = webVersions.map(web)
        const snapshot = structuredClone({ coreDocs, webDocs })
        const [result] = mergeVersionedRecords([reference], coreDocs, webDocs)
        assert.equal(result.title, `Core ${expectedCore}`)
        assert.equal(result.version_id, expectedCore)
        assert.equal(result.display_name, expectedWeb ? `Display ${expectedWeb}` : undefined)
        assert.deepEqual({ coreDocs, webDocs }, snapshot)
    })
}

test('selection handles Solr arrays and versioned core identifiers', () => {
    const records = [
        { identifier: [lid], version_id: ['1.0'] },
        { identifier: [`${lid}::1.1`] },
        { identifier: [lid], version_id: ['1.10'] },
    ]
    assert.equal(selectVersionedRecord(records, `${lid}::1.1`), records[1])
    assert.equal(selectVersionedRecord(records, lid), records[2])
})

test('unrelated and unversioned records cannot displace a known latest version', () => {
    const known = core('1.10')
    assert.equal(selectVersionedRecord([
        { identifier: 'urn:nasa:pds:other:data', version_id: '99.0' },
        { identifier: lid }, known, core('1.9'),
    ], lid), known)
})

test('no core records yields no collection; duplicate references produce one row', () => {
    assert.deepEqual(mergeVersionedRecords([lid], [], [web('1.1')]), [])
    assert.equal(mergeVersionedRecords([lid, lid], [core('1.1')], []).length, 1)
})

// Run the actual API module with only its network dependencies stubbed. VM linking
// supports the project's Next.js import aliases without adding a build tool.
async function loadDatasetApi(httpGetIdentifiers, httpGet) {
    const context = vm.createContext({})
    const router = new vm.SyntheticModule(['default'], function() {
        this.setExport('default', { datasetCore: 'core', datasetWeb: 'web' })
    }, { context })
    const common = new vm.SyntheticModule(['httpGetIdentifiers', 'httpGet', 'stitchWithWebFields'], function() {
        this.setExport('httpGetIdentifiers', httpGetIdentifiers)
        this.setExport('httpGet', httpGet)
        this.setExport('stitchWithWebFields', () => {})
    }, { context })
    const modules = new Map([['api/router.js', router], ['api/common.js', common]])
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
    const source = await readFile(new URL('../api/dataset.js', import.meta.url), 'utf8')
    const module = new vm.SourceTextModule(source, { context })
    await module.link(link)
    await module.evaluate()
    return module.namespace
}

test('bundle lookup requests core version metadata and retains the requested VID for selection', async () => {
    const calls = []
    const api = await loadDatasetApi(async (route, identifiers, fields) => {
        calls.push({ route, identifiers: [...identifiers], fields: [...fields] })
        return [core('1.0'), core('1.1'), core('1.2')]
    }, async (route, params) => {
        calls.push({ route, params })
        return [web('1.0'), web('1.1'), web('1.2')]
    })
    const [result] = await api.getCollectionsForDataset({ collection_ref: [`${lid}::1.1`] })
    assert.equal(result.version_id, '1.1')
    assert.equal(result.display_name, 'Display 1.1')
    assert.deepEqual(calls[0].identifiers, [lid])
    assert.ok(calls[0].fields.includes('version_id'))
    assert.equal(calls[1].route, 'web')
    assert.ok(calls[1].params.q.includes('urn\\:nasa\\:pds\\:example\\:data'))
})

test('empty collections avoid requests', async () => {
    const unexpected = () => { throw new Error('Unexpected request') }
    const api = await loadDatasetApi(unexpected, unexpected)
    assert.equal((await api.getCollectionsForDataset({})).length, 0)
    assert.equal((await api.getCollectionsForDataset({ collection_ref: [] })).length, 0)
})

for(const source of ['core', 'supplemental']) {
    test(`${source} request failures reject rather than hanging`, async () => {
        const failure = new Error(`${source} unavailable`)
        const api = await loadDatasetApi(
            async () => { if(source === 'core') throw failure; return [core('1.1')] },
            async () => { if(source === 'supplemental') throw failure; return [web('1.1')] },
        )
        await assert.rejects(api.getCollectionsForDataset({ collection_ref: [lid] }), error => error === failure)
    })
}
