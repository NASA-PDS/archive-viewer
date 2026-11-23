import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import vm from 'node:vm'
import { createVersionedRecordLookup } from '../services/versionedRecords.js'

const lid = 'urn:nasa:pds:example:data'
const web = version => ({ logical_identifier: `${lid}::${version}`, display_name: `Display ${version}` })
const contexts = { MISSION_MORE_DATA: 'mission_more_data', TARGET_MORE_DATA: 'target_more_data', UNKNOWN: 'unknown' }

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
    stub('api/router.js', { default: {
        datasetCore: 'core', datasetWeb: 'web', relationships: 'relationships',
        targetMissionRelationshipTypes: 'targetTypes', instrumentSpacecraftRelationshipTypes: 'instrumentTypes',
    } })
    stub('services/pages.js', { types: {}, contexts, resolveType: () => {}, resolveContext: () => contexts.UNKNOWN })
    stub('./tools', { stitchWithTools: result => result })
    async function link(specifier) {
        const key = ['./LogicalIdentifier.js', 'services/LogicalIdentifier'].includes(specifier)
            ? 'services/LogicalIdentifier.js'
            : specifier
        if(!modules.has(key)) {
            const source = await readFile(new URL(`../${key}`, import.meta.url), 'utf8')
            const module = new vm.SourceTextModule(source, { context })
            modules.set(key, module)
        }
        return modules.get(key)
    }
    const source = await readFile(new URL('../api/common.js', import.meta.url), 'utf8')
    const module = new vm.SourceTextModule(source, { context })
    modules.set('api/common.js', module)
    await module.link(link)
    await module.evaluate()
    return module.namespace
}

function response(docs, config) {
    return { data: { responseHeader: { params: config.params }, response: { numFound: docs.length, docs } } }
}

test('mission More Data matches direct investigation references or targets in major relationship groups', async () => {
    const mission = { identifier: 'urn:nasa:pds:context:investigation:mission.near' }
    const targets = ['eros', 'mathilde', 'earth', 'moon', 'unknown', 'comet', 'calibration'].map(name => ({
        identifier: `urn:nasa:pds:context:target:${name}${name === 'eros' ? '::1.0' : ''}`,
    }))
    const relationshipTypes = [['Primary', 0], ['Secondary', 1], ['Ignore', 1000], ['Flyby', 99], ['Minor', 100]].map(([name, order]) => ({
        name, order, relationshipId: name.toLowerCase(),
    }))
    const relationships = ['primary', 'secondary', 'ignore', 'ignore', null, 'flyby', 'minor']
        .map((relationshipId, index) => ({
            relationshipId, investigation: mission.identifier, target: targets[index].identifier.split('::')[0],
        }))
        .filter(relationship => relationship.relationshipId)
    const bundles = [
        ['near_bundle', 'investigation_ref', mission],
        ['iue_bundle', 'target_ref', targets[0]],
        ['mathilde_bundle', 'target_ref', targets[1]],
        ['hayabusa2_bundle', 'target_ref', targets[2]],
        ['ladee_bundle', 'target_ref', targets[3]],
        ['unknown_bundle', 'target_ref', targets[4]],
        ['flyby_bundle', 'target_ref', targets[5]],
        ['minor_bundle', 'target_ref', targets[6]],
    ]
    const api = await loadCommonApi(async (route, config) => {
        if(route === 'targetTypes') return response(relationshipTypes, config)
        const query = config.params.q.replaceAll('\\', '')
        if(route === 'relationships') {
            return response(relationships.filter(rel => query.includes(`target:"${rel.target}"`)), config)
        }
        if(route !== 'core') return response([], config)
        const matches = bundles
            .filter(([, field, ref]) => query.includes(`${field}:${ref.identifier.split('::')[0]}::*`))
            .map(([name]) => ({ identifier: `urn:nasa:pds:${name}` }))
        return response(matches, config)
    })

    const missionResults = await api.getMoreDatasetsForContext([mission], targets, contexts.MISSION_MORE_DATA)
    assert.deepEqual(Array.from(missionResults, row => row.identifier), [
        'urn:nasa:pds:near_bundle', 'urn:nasa:pds:iue_bundle', 'urn:nasa:pds:mathilde_bundle', 'urn:nasa:pds:flyby_bundle',
    ])
    assert.ok(targets.every(target => !target.relatedBy))

    const targetResults = await api.getMoreDatasetsForContext([], [targets[2]], contexts.TARGET_MORE_DATA)
    assert.deepEqual(Array.from(targetResults, row => row.identifier), ['urn:nasa:pds:hayabusa2_bundle'])
})

test('mission More Data keeps the investigation query when relationship types are unavailable', async () => {
    const mission = { identifier: 'urn:nasa:pds:context:investigation:mission.near' }
    const earth = { identifier: 'urn:nasa:pds:context:target:earth' }
    const api = await loadCommonApi(async (route, config) => {
        if(route === 'targetTypes') throw { message: 'Unavailable', response: { status: 403 } }
        if(route !== 'core') return response([], config)
        assert.match(config.params.q, /investigation_ref:/)
        assert.doesNotMatch(config.params.q, /target_ref:/)
        return response([{ identifier: lid }], config)
    })
    const results = await api.getMoreDatasetsForContext([mission], [earth], contexts.MISSION_MORE_DATA)
    assert.deepEqual(Array.from(results, row => row.identifier), [lid])
})

test('target More Data keeps direct target matches and only expands through major missions', async () => {
    const target = { identifier: 'urn:nasa:pds:context:target:pan' }
    const missions = [
        { identifier: 'urn:nasa:pds:context:investigation:major', relatedBy: { order: 99 } },
        { identifier: 'urn:nasa:pds:context:investigation:minor', relatedBy: { order: 100 } },
        { identifier: 'urn:nasa:pds:context:investigation:ignored', relatedBy: { order: 1000 } },
        { identifier: 'urn:nasa:pds:context:investigation:unclassified' },
    ]
    const bundles = [
        { identifier: 'urn:nasa:pds:direct_bundle', target_ref: target.identifier, investigation_ref: missions[1].identifier },
        ...missions.map(({ identifier }, index) => ({
            identifier: `urn:nasa:pds:indirect_bundle_${index}`,
            investigation_ref: identifier,
        })),
    ]
    const api = await loadCommonApi(async (route, config) => {
        if(route !== 'core') return response([], config)
        const query = config.params.q.replaceAll('\\', '')
        const matches = bundles.filter(bundle => ['target_ref', 'investigation_ref'].some(field =>
            bundle[field] && query.includes(`${field}:${bundle[field]}::*`)
        ))
        return response(matches, config)
    })
    const results = await api.getMoreDatasetsForContext(missions, [target], contexts.TARGET_MORE_DATA)
    assert.deepEqual(Array.from(results, row => row.identifier), ['urn:nasa:pds:direct_bundle', 'urn:nasa:pds:indirect_bundle_0'])
})

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
