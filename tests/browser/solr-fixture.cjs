const { createServer } = require('node:http')

const targetLid = 'urn:nasa:pds:context:target:asteroid.101955_bennu'
const bundleLid = 'urn:nasa:pds:smoke_bundle'
const collectionLid = `${bundleLid}:data`
// Next prefetches the other featured links on the home page too.
const featured = [
    ['urn:nasa:pds:context:investigation:mission.orex', 'OSIRIS-REx'],
    ['urn:nasa:pds:context:investigation:mission.dawn_mission_to_vesta_and_ceres', 'Dawn'],
    ['urn:nasa:pds:context:investigation:mission.near_earth_asteroid_rendezvous', 'NEAR'],
    ['urn:nasa:pds:context:investigation:mission.new_horizons', 'New Horizons'],
    ['urn:nasa:pds:context:investigation:mission.hayabusa', 'Hayabusa'],
    ['urn:jaxa:darts:context:investigation:mission.hyb2', 'Hayabusa 2'],
    ['urn:esa:psa:context:investigation:mission.international_rosetta_mission', 'Rosetta'],
    ['urn:nasa:pds:context:target:dwarf_planet.1_ceres', 'Ceres'],
    ['urn:nasa:pds:context:target:asteroid.4_vesta', 'Vesta'],
    ['urn:nasa:pds:context:target:asteroid.433_eros', 'Eros'],
    ['urn:nasa:pds:context:target:asteroid.25143_itokawa', 'Itokawa'],
    ['urn:nasa:pds:context:target:asteroid.162173_ryugu', 'Ryugu'],
    ['urn:nasa:pds:context:target:comet.67p_churyumov-gerasimenko', '67P'],
    ['urn:nasa:pds:context:target:dwarf_planet.134340_pluto', 'Pluto'],
].map(([identifier, title]) => ({ identifier, title, version_id: '1.0', data_class: identifier.includes(':target:') ? 'Target' : 'Investigation' }))

// Small representative records, not a copy of the production index.
const core = [
    { identifier: targetLid, version_id: '1.0', data_class: 'Target', title: '101955 Bennu', target_description: 'Core target description.' },
    { identifier: bundleLid, version_id: '1.0', objectType: 'Product_Bundle', product_class: 'Product_Bundle', title: 'Bennu Sample Bundle', description: 'A sample derived data bundle.', target_ref: [`${targetLid}::1.0`], collection_ref: [`${collectionLid}::1.0`], collection_type: ['Data'], citation_publication_year: '2026' },
    { identifier: collectionLid, version_id: '1.0', objectType: 'Product_Collection', product_class: 'Product_Collection', title: 'Bennu Sample Collection', description: 'A sample data collection.', target_ref: [`${targetLid}::1.0`], collection_type: ['Data'], primary_result_purpose: 'SCIENCE' },
    ...featured,
]
const supplemental = {
    'web-targets-alias': [{ identifier: targetLid, logical_identifier: `${targetLid}::1.0`, display_name: 'Bennu', tags: ['asteroid'], display_description: 'Supplemental Bennu description.', image_url: '/images/sbn.png' }],
    'web-datasets-alias': [
        { logical_identifier: `${bundleLid}::1.0`, display_name: 'Bennu Sample Bundle', primary_context: 'target_derived_data' },
        { logical_identifier: `${collectionLid}::1.0`, display_name: 'Bennu Sample Collection', primary_context: 'target_derived_data' },
    ],
    'web-investigations-alias': [],
    'web-instruments-alias': [],
    'web-instrumenthosts-alias': [],
    'web-targetrelationships-alias': [],
    'web-objectrelationships-alias': [],
    'web-targetmissionrelationshiptypes-alias': [],
    'web-instrumentspacecraftrelationshiptypes-alias': [],
    'web-tools-alias': [],
}

function select(collection, params) {
    const query = (params.get('q') || '*:*').replaceAll('\\', '')
    if (params.get('fq')?.includes('pds3')) return []
    let docs = collection === 'pds-alias' ? core : supplemental[collection]
    if (!docs) throw new Error(`Unknown fixture collection: ${collection}`)
    if (query === '*:*') return docs

    // Only the query shapes exercised by the smoke journeys are supported.
    // Fail unknown queries rather than silently hide a request regression.
    if (query.includes('data_class:*')) {
        return docs.filter(doc => doc.data_class && query.includes(`identifier:"${doc.identifier}"`))
    }
    if (query.includes('product_class:"Product_Bundle"')) {
        return docs.filter(doc => doc.product_class === 'Product_Bundle' && (
            query.includes('target_ref:') && query.includes(targetLid)
            || query.includes('collection_ref:') && query.includes(`${collectionLid}::1.0`)
        ))
    }
    if (query.includes('data_class:"Investigation"')) return []
    if (/^(identifier|logical_identifier):/.test(query)) {
        const identifiers = [...query.matchAll(/"([^"]+)"/g)].map(match => match[1].split('::')[0])
        return docs.filter(doc => identifiers.includes((doc.logical_identifier || doc.identifier).split('::')[0]))
    }
    if (query.startsWith('tags:')) {
        const tags = [...query.matchAll(/tags:"([^"]+)"/g)].map(match => match[1])
        return docs.filter(doc => doc.tags?.some(tag => tags.includes(tag)))
    }
    if (docs.length === 0) return []
    throw new Error(`Unsupported fixture query for ${collection}: ${query}`)
}

function createSolrFixture() {
    return createServer((req, res) => {
        const url = new URL(req.url, 'http://127.0.0.1:3101')
        if (url.pathname === '/health') { res.end('OK'); return }
        if (!/^\/solr\/[^/]+\/select$/.test(url.pathname)) {
            res.writeHead(404).end('Unknown fixture endpoint')
            return
        }
        // Test credentials also verify the real proxy adds its auth header.
        if (req.headers.authorization !== `Basic ${Buffer.from('smoke:smoke').toString('base64')}`) {
            res.writeHead(401).end('Missing fixture authorization')
            return
        }
        try {
            const params = url.searchParams
            const docs = select(url.pathname.split('/')[2], params)
            const start = Number(params.get('start') || 0)
            const rows = Number(params.get('rows') || 50)
            const fields = params.get('fl')?.split(',').map(field => field.trim())
            const page = docs.slice(start, start + rows).map(doc => fields && !fields.includes('*')
                ? Object.fromEntries(Object.entries(doc).filter(([field]) => fields.includes(field))) : doc)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ responseHeader: { status: 0, params: { start: String(start) } }, response: { numFound: docs.length, start, docs: page } }))
        } catch (error) {
            console.error(error.message)
            res.writeHead(400).end(error.message)
        }
    })
}

module.exports = { createSolrFixture, targetLid, bundleLid, collectionLid }
