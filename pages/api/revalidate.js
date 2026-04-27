import axios from 'axios'
import { initialLookup, getMoreDatasetsForContext } from 'api/common'
import { familyLookup } from 'api/context'
import { getBundlesForCollection, getCollectionsForDataset } from 'api/dataset'
import { getDatasetsForInstrument, getPrimaryBundleForInstrument } from 'api/instrument'
import { getFriendlyMissions, getPrimaryBundleForMission } from 'api/mission'
import { getDerivedDatasetsForTarget, getMissionsForTarget, getRelatedTargetsForTarget } from 'api/target'
import LID from 'services/LogicalIdentifier'
import { contexts, pagePaths, resolveContext, resolveType, types } from 'services/pages'
import { getCoreSelectUrl } from 'services/solr'
import {
    appendRevalidateJobFailures,
    createRevalidateJob,
    getRevalidateJob,
    updateRevalidateJob
} from 'services/revalidateJobs'

const coreSelect = getCoreSelectUrl()
const defaultAllLookupTimeoutMs = 1000 * 60 * 10
const defaultPathRevalidateTimeoutMs = 1000 * 60 * 5
const coreDocFields = [
    'identifier',
    'version_id',
    'data_class',
    'objectType',
    'product_class',
    'instrument_ref',
    'investigation_ref',
    'instrument_host_ref',
    'target_ref',
    'collection_ref',
].join(',')

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

function getAllLookupTimeoutMs() {
    return parsePositiveInt(process.env.REVALIDATE_ALL_SOLR_TIMEOUT_MS, defaultAllLookupTimeoutMs)
}

function getPathRevalidateTimeoutMs() {
    return parsePositiveInt(process.env.REVALIDATE_PATH_TIMEOUT_MS, defaultPathRevalidateTimeoutMs)
}

async function fetchAllCoreTypeDocs() {
    const rows = 1000
    const docs = []
    let start = 0
    let numFound = Number.POSITIVE_INFINITY
    const timeout = getAllLookupTimeoutMs()

    while(start < numFound) {
        const response = await axios.get(coreSelect, {
            params: {
                wt: 'json',
                q: '*:*',
                fl: coreDocFields,
                rows,
                start,
                sort: 'identifier asc'
            },
            headers: getSolrAuthHeader(),
            timeout
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

async function revalidatePathWithTimeout(res, path) {
    const timeoutMs = getPathRevalidateTimeoutMs()
    let timeout
    try {
        await Promise.race([
            res.revalidate(path),
            new Promise((_, reject) => {
                timeout = setTimeout(() => reject(new Error(`Timed out revalidating ${path} after ${timeoutMs}ms`)), timeoutMs)
            })
        ])
    } finally {
        clearTimeout(timeout)
    }
}

async function revalidatePaths(res, paths, concurrency, callbacks = {}) {
    const failed = []
    const batches = chunkArray(paths, Math.max(1, concurrency))
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex += 1) {
        const batch = batches[batchIndex]
        if(callbacks.onBatchStart) {
            await callbacks.onBatchStart(batch, batchIndex, batches.length)
        }
        const results = await Promise.allSettled(batch.map(path => revalidatePathWithTimeout(res, path)))
        const batchFailed = []
        results.forEach((result, index) => {
            if(result.status === 'rejected') {
                batchFailed.push({
                    path: batch[index],
                    message: result.reason?.message || 'Failed'
                })
            }
        })
        failed.push(...batchFailed)
        if(callbacks.onBatchComplete) {
            await callbacks.onBatchComplete(batch, batchIndex, batches.length, batchFailed)
        }
    }
    return failed
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

function addPath(paths, keys, path) {
    if(!keys.has(path)) {
        keys.add(path)
        paths.push(path)
    }
}

function createPlan() {
    return {
        paths: [],
        pathKeys: new Set(),
        identifierKeys: new Set(),
        errors: [],
    }
}

function normalizeIdentifierParam(identifierParam) {
    return String(identifierParam || '').replace(/^\/+/, '').split('/')[0].trim()
}

function getIdentifierKeys(identifier) {
    const cleanIdentifier = normalizeIdentifierParam(identifier)
    if(!cleanIdentifier) {
        return []
    }
    try {
        const parsed = new LID(cleanIdentifier)
        return Array.from(new Set([parsed.lid, parsed.lidvid, cleanIdentifier.toLowerCase()]))
    } catch (_) {
        return [cleanIdentifier.toLowerCase()]
    }
}

function trackIdentifier(plan, identifier) {
    getIdentifierKeys(identifier).forEach(key => plan.identifierKeys.add(key))
}

function isIdentifierPlanned(plan, identifier) {
    const keys = getIdentifierKeys(identifier)
    return keys.length > 0 && keys.some(key => plan.identifierKeys.has(key))
}

function addPathsForDoc(plan, doc) {
    if(!doc || resolveType(doc) === types.UNKNOWN) {
        return
    }
    trackIdentifier(plan, doc.identifier)
    buildStaticPathsForDoc(doc).forEach(path => addPath(plan.paths, plan.pathKeys, path))
}

function addDocsToPlan(plan, docs) {
    (docs || []).filter(Boolean).forEach(doc => addPathsForDoc(plan, doc))
}

async function addPrimaryBundlesForMissions(plan, missions) {
    const friendlyMissions = missions && missions.length > 0 ? await getFriendlyMissions(missions) : []
    for (const mission of friendlyMissions || []) {
        const bundle = await getPrimaryBundleForMission(mission)
        addPathsForDoc(plan, bundle)
    }
}

async function addInstrumentBundles(plan, instruments) {
    for (const instrument of instruments || []) {
        const datasets = await getDatasetsForInstrument(instrument)
        addDocsToPlan(plan, datasets)
        const primaryBundle = await getPrimaryBundleForInstrument(instrument)
        addPathsForDoc(plan, primaryBundle)
    }
}

async function addCollectionPaths(plan, collection) {
    addPathsForDoc(plan, collection)
    const bundles = await getBundlesForCollection(collection)
    addDocsToPlan(plan, bundles)
}

async function addCollectionsForBundles(plan, bundles) {
    for (const bundle of bundles || []) {
        addPathsForDoc(plan, bundle)
        const collections = await getCollectionsForDataset(bundle)
        addDocsToPlan(plan, collections)
    }
}

async function addMissionContextPaths(plan, model) {
    const family = await familyLookup(model)
    addDocsToPlan(plan, family?.missions)
    addDocsToPlan(plan, family?.spacecraft)
    addDocsToPlan(plan, family?.instruments)
    addDocsToPlan(plan, family?.targets)

    await addPrimaryBundlesForMissions(plan, family?.missions || [])
    await addInstrumentBundles(plan, family?.instruments || [])

    if((family?.missions || []).length > 0 || (family?.targets || []).length > 0) {
        const moreDatasets = await getMoreDatasetsForContext(family?.missions || [], family?.targets || [], contexts.MISSION_MORE_DATA)
        await addCollectionsForBundles(plan, moreDatasets)
    }
}

async function addTargetContextPaths(plan, model) {
    addPathsForDoc(plan, model)

    const relatedTargets = await getRelatedTargetsForTarget(model)
    addDocsToPlan(plan, relatedTargets)

    const targetMissions = await getMissionsForTarget(model)
    addDocsToPlan(plan, targetMissions)

    const targetDatasets = await getDerivedDatasetsForTarget(model)
    await addCollectionsForBundles(plan, targetDatasets)

    const moreDatasets = await getMoreDatasetsForContext(targetMissions || [], [model], contexts.TARGET_MORE_DATA)
    await addCollectionsForBundles(plan, moreDatasets)
}

function getContextsForModel(model) {
    const type = resolveType(model)
    if([types.MISSION, types.INSTRUMENT, types.SPACECRAFT].includes(type)) {
        return ['mission']
    }
    if(type === types.TARGET) {
        return ['target']
    }

    const context = resolveContext(model)
    switch(context) {
        case contexts.MISSION:
        case contexts.MISSION_INSTRUMENT_DATA:
        case contexts.MISSION_MORE_DATA:
            return ['mission']
        case contexts.TARGET:
        case contexts.TARGET_DERIVED_DATA:
        case contexts.TARGET_MORE_DATA:
            return ['target']
        case contexts.MISSIONANDTARGET:
            return ['mission', 'target']
        default:
            return []
    }
}

async function addPathsForIdentifier(plan, identifierParam) {
    const identifier = normalizeIdentifierParam(identifierParam)
    if(!identifier) {
        return
    }

    trackIdentifier(plan, identifier)

    let model
    try {
        model = await initialLookup(identifier, false)
    } catch (error) {
        plan.errors.push({
            identifier,
            message: error?.message || 'Identifier lookup failed'
        })
        addPath(plan.paths, plan.pathKeys, `/${identifier}`)
        return
    }

    const type = resolveType(model)
    if(type === types.COLLECTION) {
        await addCollectionPaths(plan, model)
        return
    }

    addPathsForDoc(plan, model)

    const contextsForModel = getContextsForModel(model)
    if(contextsForModel.includes('mission')) {
        await addMissionContextPaths(plan, model)
    }
    if(contextsForModel.includes('target')) {
        await addTargetContextPaths(plan, model)
    }
}

async function planPathsForIdentifiers(identifiers) {
    const plan = createPlan()
    for (const identifier of identifiers) {
        if(isIdentifierPlanned(plan, identifier)) {
            continue
        }
        await addPathsForIdentifier(plan, identifier)
    }
    return {
        identifiers: identifiers.map(normalizeIdentifierParam).filter(Boolean),
        paths: plan.paths,
        errors: plan.errors,
    }
}

async function runRevalidateJob(jobId, res, options) {
    updateRevalidateJob(jobId, {
        status: 'running',
        startedAt: new Date().toISOString(),
    })

    try {
        if(options.all) {
            const paths = await getAllStaticPaths()
            updateRevalidateJob(jobId, {
                total: paths.length,
                paths,
            })
            const outerBatches = chunkArray(paths, Math.max(1, options.batchSize))
            updateRevalidateJob(jobId, {
                batchCount: outerBatches.length,
            })

            const allFailed = []
            let attempted = 0
            let revalidatedPaths = 0

            for (let batchIndex = 0; batchIndex < outerBatches.length; batchIndex += 1) {
                const batch = outerBatches[batchIndex]
                updateRevalidateJob(jobId, {
                    currentBatch: batchIndex + 1,
                    currentPath: batch[0] || null,
                })
                await revalidatePaths(res, batch, options.concurrency, {
                    onBatchStart: (innerBatch) => {
                        updateRevalidateJob(jobId, {
                            currentPath: innerBatch[0] || null,
                        })
                    },
                    onBatchComplete: (innerBatch, _innerBatchIndex, _innerBatchCount, batchFailed) => {
                        attempted += innerBatch.length
                        revalidatedPaths += innerBatch.length - batchFailed.length
                        allFailed.push(...batchFailed)
                        appendRevalidateJobFailures(jobId, batchFailed)
                        updateRevalidateJob(jobId, {
                            attempted,
                            revalidatedPaths,
                        })
                    }
                })
            }

            updateRevalidateJob(jobId, {
                status: allFailed.length === 0 ? 'completed' : 'failed',
                finishedAt: new Date().toISOString(),
                currentPath: null,
                revalidated: allFailed.length === 0,
            })
            return
        }

        const paths = options.paths || []
        if(paths.length === 0) {
            updateRevalidateJob(jobId, {
                status: 'failed',
                finishedAt: new Date().toISOString(),
                total: 0,
                attempted: 0,
                currentPath: null,
                error: 'No matching path(s) to revalidate',
            })
            return
        }

        updateRevalidateJob(jobId, {
            total: paths.length,
            paths,
            batchCount: Math.ceil(paths.length / Math.max(1, options.concurrency)),
        })

        const expectedBatchCount = Math.ceil(paths.length / Math.max(1, options.concurrency))
        let attempted = 0
        let revalidatedPaths = 0
        const failed = await revalidatePaths(res, paths, options.concurrency, {
            onBatchStart: (batch, batchIndex) => {
                const failedBeforeBatch = getRevalidateJob(jobId)?.failedCount || 0
                updateRevalidateJob(jobId, {
                    currentBatch: batchIndex + 1,
                    batchCount: expectedBatchCount,
                    currentPath: batch[0] || null,
                    attempted,
                    revalidatedPaths: attempted - failedBeforeBatch,
                })
            },
            onBatchComplete: (batch, _batchIndex, _batchCount, batchFailed) => {
                attempted += batch.length
                revalidatedPaths += batch.length - batchFailed.length
                appendRevalidateJobFailures(jobId, batchFailed)
                updateRevalidateJob(jobId, {
                    attempted,
                    revalidatedPaths,
                })
            }
        })
        updateRevalidateJob(jobId, {
            failed: failed,
            failedCount: failed.length,
        })
        updateRevalidateJob(jobId, {
            status: failed.length === 0 ? 'completed' : 'failed',
            finishedAt: new Date().toISOString(),
            attempted: paths.length,
            revalidatedPaths: paths.length - failed.length,
            currentPath: null,
            revalidated: failed.length === 0,
        })
    } catch (error) {
        updateRevalidateJob(jobId, {
            status: 'failed',
            finishedAt: new Date().toISOString(),
            currentPath: null,
            error: error?.message || 'Failed to revalidate',
        })
    }
}

function isTrue(value) {
    return value === true || value === 'true'
}

function getSecretFromRequest(req) {
    const headerSecret = req.headers['x-revalidate-secret']
    if(Array.isArray(headerSecret)) {
        return headerSecret[0]
    }
    return headerSecret || req.body?.secret
}

function addIdentifierValues(values, incoming) {
    if(incoming === undefined || incoming === null) {
        return
    }
    const incomingValues = Array.isArray(incoming) ? incoming : [incoming]
    incomingValues.forEach(value => {
        if(typeof value !== 'string') {
            return
        }
        value.split(',').map(part => part.trim()).filter(Boolean).forEach(identifier => values.push(identifier))
    })
}

function getIdentifiersFromRequest(req) {
    const values = []
    addIdentifierValues(values, req.body?.identifiers)
    addIdentifierValues(values, req.body?.identifier)
    addIdentifierValues(values, req.query.identifiers)
    addIdentifierValues(values, req.query.identifier)

    const seen = new Set()
    return values
        .map(normalizeIdentifierParam)
        .filter(Boolean)
        .filter(identifier => {
            const key = identifier.toLowerCase()
            if(seen.has(key)) {
                return false
            }
            seen.add(key)
            return true
        })
}

export default async function handler(req, res) {
    if(req.method === 'GET') {
        const secret = getSecretFromRequest(req)
        if(!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
            return res.status(401).json({ message: 'Invalid token' })
        }

        const jobId = req.query.jobId
        if(!jobId) {
            return res.status(400).json({ message: 'Missing jobId' })
        }

        const job = getRevalidateJob(Array.isArray(jobId) ? jobId[0] : jobId)
        if(!job) {
            return res.status(404).json({ message: 'Job not found' })
        }

        return res.json(job)
    }

    if(req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    const secret = getSecretFromRequest(req)
    if(!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
        return res.status(401).json({ message: 'Invalid token' })
    }

    try {
        const all = isTrue(req.body?.all) || isTrue(req.query.all)
        const concurrency = Math.min(50, parsePositiveInt(req.body?.concurrency ?? req.query.concurrency, 10))
        const batchSize = Math.min(5000, parsePositiveInt(req.body?.batchSize ?? req.query.batchSize, 500))
        const identifiers = getIdentifiersFromRequest(req)
        if(!all && identifiers.length === 0) {
            return res.status(400).json({ message: 'Missing identifier (or pass all=true)' })
        }

        const planned = all ? { identifiers: [], paths: [], errors: [] } : await planPathsForIdentifiers(identifiers)
        if(!all && planned.paths.length === 0) {
            return res.status(404).json({
                accepted: false,
                all: false,
                message: 'No matching path(s) to revalidate',
                identifiers: planned.identifiers,
                errors: planned.errors,
            })
        }

        const job = createRevalidateJob({
            mode: all ? 'all' : 'identifiers',
            all,
            identifier: identifiers[0] || null,
            identifiers,
            concurrency,
            batchSize,
        })

        if(!all) {
            updateRevalidateJob(job.jobId, {
                total: planned.paths.length,
                paths: planned.paths,
                batchCount: Math.ceil(planned.paths.length / Math.max(1, concurrency)),
                planErrors: planned.errors,
            })
        }

        void runRevalidateJob(job.jobId, res, {
            all,
            paths: planned.paths,
            concurrency,
            batchSize,
        })

        return res.status(202).json({
            accepted: true,
            all,
            jobId: job.jobId,
            status: getRevalidateJob(job.jobId)?.status || job.status,
            statusUrl: `/api/revalidate?jobId=${encodeURIComponent(job.jobId)}`,
            identifiers: planned.identifiers,
            total: all ? null : planned.paths.length,
            plannedPaths: all ? [] : planned.paths,
            paths: all ? [] : planned.paths,
            errors: planned.errors,
        })
    } catch (error) {
        return res.status(500).json({
            revalidated: false,
            message: error?.message || 'Failed to revalidate'
        })
    }
}
