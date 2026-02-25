import axios from 'axios'
import LID from 'services/LogicalIdentifier'
import { pagePaths, resolveType, types } from 'services/pages'

const localSolr = process.env.NEXT_PUBLIC_SUPPLEMENTAL_SOLR || 'https://sbnpds4.psi.edu/solr'
const coreSelect = `${localSolr}/pds-alias/select`

function getSolrAuthHeader() {
    const user = process.env.SOLR_USER
    const pass = process.env.SOLR_PASS
    if(!user || !pass) {
        return {}
    }
    return {
        Authorization: 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64')
    }
}

function normalizeSingleValue(field) {
    if(Array.isArray(field)) {
        return field.length > 0 ? field[0] : null
    }
    return field
}

function normalizeCoreDoc(doc) {
    return {
        ...doc,
        identifier: normalizeSingleValue(doc?.identifier),
        version_id: normalizeSingleValue(doc?.version_id),
        data_class: normalizeSingleValue(doc?.data_class),
        objectType: normalizeSingleValue(doc?.objectType),
    }
}

function normalizeVersion(versionIdField) {
    if(Array.isArray(versionIdField)) {
        return versionIdField.length > 0 ? String(versionIdField[0]) : null
    }
    if(versionIdField === undefined || versionIdField === null || versionIdField === '') {
        return null
    }
    return String(versionIdField)
}

function getLidAndLidvid(doc) {
    const identifier = doc?.identifier
    if(!identifier || typeof identifier !== 'string') {
        return null
    }
    try {
        const normalized = identifier.trim().toLowerCase()
        if(!normalized.startsWith('urn:')) {
            return null
        }
        const lid = new LID(normalized).lid
        const version = normalizeVersion(doc.version_id)
        const lidvid = version ? `${lid}::${version}` : lid
        return [lid, lidvid]
    } catch (_) {
        return null
    }
}

function getTypeSpecificSubpaths(doc) {
    const type = resolveType(doc)
    switch(type) {
        case types.MISSION:
            return [
                pagePaths[types.MISSIONTOOLS],
                pagePaths[types.MISSIONINSTRUMENTS],
                pagePaths[types.MISSIONTARGETS],
                pagePaths[types.MOREDATA],
            ]
        case types.TARGET:
            return [
                pagePaths[types.TARGETRELATED],
                pagePaths[types.TARGETTOOLS],
                pagePaths[types.TARGETDATA],
                pagePaths[types.TARGETMISSIONS],
                pagePaths[types.MOREDATA],
            ]
        default:
            return []
    }
}

async function fetchAllCoreTypeDocs() {
    const rows = 1000
    const docs = []
    let start = 0
    let numFound = Number.POSITIVE_INFINITY

    while(start < numFound) {
        const response = await axios.get(coreSelect, {
            params: {
                wt: 'json',
                q: '*:*',
                fl: 'identifier,version_id,data_class,objectType',
                rows,
                start,
                sort: 'identifier asc'
            },
            headers: getSolrAuthHeader(),
            timeout: 30000
        })
        const solr = response?.data
        const pageDocs = solr?.response?.docs || []
        docs.push(...pageDocs)
        numFound = Number.parseInt(solr?.response?.numFound || 0, 10)
        start += pageDocs.length
        if(pageDocs.length === 0) {
            break
        }
    }
    return docs.map(normalizeCoreDoc)
}

async function getAllStaticPaths() {
    const docs = await fetchAllCoreTypeDocs()
    const keys = new Set()
    const paths = []

    for (const doc of docs) {
        if(resolveType(doc) === types.UNKNOWN) {
            continue
        }
        const identifiers = getLidAndLidvid(doc)
        if(!identifiers) {
            continue
        }
        const [lid, lidvid] = identifiers
        const routeVariants = [lid]
        if(lidvid !== lid) {
            routeVariants.push(lidvid)
        }
        const typeSpecificSubpaths = getTypeSpecificSubpaths(doc)
        for (const identifier of routeVariants) {
            for (const route of [[identifier], ...typeSpecificSubpaths.map(subPath => [identifier, subPath])]) {
                const path = `/${route.join('/')}`
                if(!keys.has(path)) {
                    keys.add(path)
                    paths.push(path)
                }
            }
        }
    }
    return paths
}

function parsePositiveInt(input, fallback) {
    const parsed = Number.parseInt(input, 10)
    if(Number.isNaN(parsed) || parsed < 0) {
        return fallback
    }
    return parsed
}

function chunkArray(items, size) {
    const chunks = []
    for(let i = 0; i < items.length; i += size) {
        chunks.push(items.slice(i, i + size))
    }
    return chunks
}

async function revalidatePaths(res, paths, concurrency) {
    const failed = []
    const batches = chunkArray(paths, Math.max(1, concurrency))
    for (const batch of batches) {
        const results = await Promise.allSettled(batch.map(path => res.revalidate(path)))
        results.forEach((result, index) => {
            if(result.status === 'rejected') {
                failed.push({
                    path: batch[index],
                    message: result.reason?.message || 'Failed'
                })
            }
        })
    }
    return failed
}

async function revalidateAllPaths(res, paths, batchSize, concurrency) {
    const allFailed = []
    const batches = chunkArray(paths, Math.max(1, batchSize))
    for (const batch of batches) {
        const failed = await revalidatePaths(res, batch, concurrency)
        allFailed.push(...failed)
    }
    return {
        failed: allFailed,
        batchCount: batches.length,
    }
}

async function fetchCoreDocForIdentifier(identifier) {
    let lid
    try {
        lid = new LID(identifier).lid
    } catch (_) {
        return null
    }

    const response = await axios.get(coreSelect, {
        params: {
            wt: 'json',
            q: `identifier:"${new LID(lid).escapedLid}"`,
            fl: 'identifier,version_id,data_class,objectType',
            rows: 1
        },
        headers: getSolrAuthHeader(),
        timeout: 30000
    })

    const doc = response?.data?.response?.docs?.[0]
    return doc ? normalizeCoreDoc(doc) : null
}

function buildStaticPathsForDoc(doc) {
    const keys = new Set()
    const paths = []
    const identifiers = getLidAndLidvid(doc)
    if(!identifiers) {
        return paths
    }
    const [lid, lidvid] = identifiers
    const routeVariants = [lid]
    if(lidvid !== lid) {
        routeVariants.push(lidvid)
    }
    const typeSpecificSubpaths = getTypeSpecificSubpaths(doc)
    for (const identifier of routeVariants) {
        for (const route of [[identifier], ...typeSpecificSubpaths.map(subPath => [identifier, subPath])]) {
            const path = `/${route.join('/')}`
            if(!keys.has(path)) {
                keys.add(path)
                paths.push(path)
            }
        }
    }
    return paths
}

async function getPathsForIdentifier(identifierParam) {
    const cleanIdentifier = String(identifierParam || '').replace(/^\/+/, '')
    const explicitPath = cleanIdentifier ? `/${cleanIdentifier}` : null
    const baseIdentifier = cleanIdentifier.split('/')[0]
    const paths = []
    const keys = new Set()

    if(baseIdentifier) {
        try {
            const doc = await fetchCoreDocForIdentifier(baseIdentifier)
            if(doc && resolveType(doc) !== types.UNKNOWN) {
                buildStaticPathsForDoc(doc).forEach(path => {
                    if(!keys.has(path)) {
                        keys.add(path)
                        paths.push(path)
                    }
                })
            }
        } catch (_) {
            // fallback to explicit path only
        }
    }

    if(explicitPath && !keys.has(explicitPath)) {
        paths.push(explicitPath)
    }

    return paths
}

export default async function handler(req, res) {
    if(req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    const secret = req.query.secret || req.body?.secret
    if(!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
        return res.status(401).json({ message: 'Invalid token' })
    }

    try {
        const all = req.body?.all === true || req.query.all === 'true'
        const concurrency = Math.min(50, parsePositiveInt(req.body?.concurrency ?? req.query.concurrency, 10))
        const batchSize = Math.min(5000, parsePositiveInt(req.body?.batchSize ?? req.query.batchSize, 500))
        if(all) {
            const paths = await getAllStaticPaths()
            const { failed, batchCount } = await revalidateAllPaths(res, paths, batchSize, concurrency)
            return res.json({
                revalidated: failed.length === 0,
                all: true,
                total: paths.length,
                attempted: paths.length,
                concurrency,
                batchSize,
                batchCount,
                failedCount: failed.length,
                failed: failed.slice(0, 100),
            })
        }

        const identifier = req.body?.identifier || req.query.identifier
        if(!identifier) {
            return res.status(400).json({ message: 'Missing identifier (or pass all=true)' })
        }

        const cleanIdentifier = Array.isArray(identifier) ? identifier[0] : identifier
        const paths = await getPathsForIdentifier(cleanIdentifier)
        if(paths.length === 0) {
            return res.status(404).json({ revalidated: false, all: false, message: 'No matching path(s) to revalidate' })
        }
        const failed = await revalidatePaths(res, paths, concurrency)
        return res.json({
            revalidated: failed.length === 0,
            all: false,
            identifier: cleanIdentifier,
            attempted: paths.length,
            revalidatedPaths: paths.length - failed.length,
            failedCount: failed.length,
            failed: failed,
            paths,
        })
    } catch (error) {
        return res.status(500).json({
            revalidated: false,
            message: error?.message || 'Failed to revalidate'
        })
    }
}
