import { getMoreDatasetsForContext, initialLookup } from 'api/common';
import { familyLookup } from 'api/context';
import { getBundlesForCollection, getCollectionsForDataset } from 'api/dataset';
import { getDatasetsForInstrument, getPrimaryBundleForInstrument } from 'api/instrument';
import { getFriendlyMissions, getFriendlyTargetsForMission, getPrimaryBundleForMission } from 'api/mission';
import { getFriendlyInstrumentsForSpacecraft, getFriendlySpacecraft } from 'api/spacecraft';
import { getDerivedDatasetsForTarget, getFriendlyTargets, getMissionsForTarget, getRelatedTargetsForTarget } from 'api/target';
import web from 'axios';
import MissionContext from 'components/contexts/MissionContext';
import TargetContext from 'components/contexts/TargetContext';
import UnknownContext from 'components/contexts/UnknownContext';
import ErrorContext from 'components/contexts/ErrorContext';
import Loading from 'components/Loading';
import { PDS3Dataset } from 'components/pages/Dataset.js';
import FrontPage from 'pages/index';
import React from 'react';
import LID from 'services/LogicalIdentifier';
import { contexts, pagePaths, resolveType, setTheme, types } from 'services/pages.js';
import GlobalContext from 'components/contexts/GlobalContext';
import Themed from 'components/Themed';
import Head from 'next/head'
import { useRouter } from 'next/router';
// Set up logging - only on server side
// if (typeof window === 'undefined') {
//     const betterLogging = require('better-logging').default;
//     const { Theme } = require('better-logging');
//     betterLogging(console, {
//         color: Theme.dark,
//         format: ctx => `${ctx.date} ${ctx.time12} ${ctx.type} ${ctx.msg}`
//     })
// }
function ProductPageContent({error, loaded, model, type, ...otherProps}) {

    if(error) {
        return <ErrorContext error={error} lidvid={otherProps.lidvid}/>
    } else if (!loaded) {
        return <Loading fullscreen={true} />
    } else {
        switch(type) {
            case types.PDS3: return <PDS3Dataset dataset={model} {...otherProps}/>
            case types.TARGET: return <TargetContext type={type} target={model} model={model} {...otherProps}/>
            case types.INSTRUMENT: 
            case types.SPACECRAFT:
            case types.MISSION: return <MissionContext type={type} model={model} {...otherProps}/>
            case types.BUNDLE: 
            case types.COLLECTION: return <UnknownContext model={model} type={type} {...otherProps}/>
            default: return <FrontPage />
        }
    }
}

function ProductPage(props) {
    const router = useRouter()
    const pdsOnly = props.pdsOnly || router.query.pdsOnly === 'true'
    const mockup = props.mockup || router.query.mockup === 'true'
    const normalizedProps = { ...props, pdsOnly, mockup }
    const {error, model, backupMode, lidvid} = normalizedProps
    if(!error) {

        const {display_name, title} = model
        const pageTitle = (display_name && !pdsOnly ? display_name : title) + ' - NASA Planetary Data System'

        return (
        <Themed {...normalizedProps}>
            <GlobalContext backupMode={backupMode}>
                <PageMetadata pageTitle={pageTitle}/>
                <ProductPageContent {...normalizedProps} />
            </GlobalContext>
        </Themed>
        )
    } else {
        return (
            <Themed {...normalizedProps}>
                <GlobalContext backupMode={backupMode}>
                    <PageMetadata pageTitle={"Error"}/>
                    <ErrorContext error={error} lidvid={lidvid}/>
                </GlobalContext>
            </Themed>
        )
    }
}

function PageMetadata({pageTitle}) {
    return <Head>
        <title>{ pageTitle }</title>
        <meta charSet="utf-8" />
    </Head>
}

export default ProductPage

export async function getStaticPaths() {
    resetBuildReport()
    const docs = (await fetchAllCoreTypeDocs()).map(normalizeCoreDoc)
    const keys = new Set()
    const paths = []
    let parsedIdentifiers = 0
    let skippedIdentifiers = 0
    let skippedUnsupportedTypes = 0

    for (const doc of docs) {
        if(resolveType(doc) === types.UNKNOWN) {
            skippedUnsupportedTypes += 1
            continue
        }

        const identifiers = getLidAndLidvid(doc)
        if(!identifiers) {
            skippedIdentifiers += 1
            continue
        }
        parsedIdentifiers += 1
        const [lid, lidvid] = identifiers
        const routeVariants = [lid]

        if(lidvid !== lid) {
            routeVariants.push(lidvid)
        }

        const typeSpecificSubpaths = getTypeSpecificSubpaths(doc)

        for (const identifier of routeVariants) {
            for (const path of [[identifier], ...typeSpecificSubpaths.map(subPath => [identifier, subPath])]) {
                const key = path.join('/')
                if(!keys.has(key)) {
                    keys.add(key)
                    paths.push({ params: { identifier: path } })
                }
            }
        }
    }

    console.log(`getStaticPaths: generated ${paths.length} paths from ${docs.length} core records (parsed=${parsedIdentifiers}, skippedIdentifier=${skippedIdentifiers}, skippedUnsupportedType=${skippedUnsupportedTypes})`)
    appendBuildReport({
        phase: 'getStaticPaths',
        docs: docs.length,
        parsedIdentifiers,
        skippedIdentifiers,
        skippedUnsupportedTypes,
        generatedPaths: paths.length
    })
    return {
        paths,
        fallback: 'blocking'
    }
}

export async function getStaticProps(context) {
    const { params } = context
    if(!params || !Array.isArray(params.identifier) || params.identifier.length === 0) {
        return {
            notFound: true,
        }
    }

    const [lidvid, ...extraPath] = params.identifier
    let props = { lidvid, extraPath };
    const routePath = '/' + params.identifier.join('/')
    let initialLookupError
    let prefetchErrors = []

    try {
        const result = await initialLookup(lidvid, false)
        
        props.loaded = true
        props.type = resolveType(result)
        props.model = result
        const prefetchResult = await prefetchForRoute(result, props.type, extraPath)
        props.prefetch = compactUndefined(prefetchResult.prefetch)
        prefetchErrors = prefetchResult.errors
    } catch(err) {
        console.log(err)
        initialLookupError = err

        const summarized = summarizeError(err)
        appendBuildReport({
            phase: 'getStaticProps',
            path: routePath,
            lidvid,
            type: null,
            status: 'skipped_not_found',
            initialLookupError: summarized,
            prefetchErrorCount: 0,
            prefetchErrors: [],
        })

        return {
            notFound: true,
        }
    }

    appendBuildReport({
        phase: 'getStaticProps',
        path: routePath,
        lidvid,
        type: props.type || null,
        status: props.error ? 'error' : 'ok',
        initialLookupError: summarizeError(initialLookupError),
        prefetchErrorCount: prefetchErrors.length,
        prefetchErrors,
    })

    setTheme(props, context)

    return {
        props
    }

}

async function prefetchForRoute(model, type, extraPath) {
    const prefetch = {}
    const errors = []
    const hasSubPath = (pathType) => extraPath.includes(pagePaths[pathType])
    const safePrefetch = async (label, fn) => {
        try {
            return await fn()
        } catch (error) {
            console.log('Prefetch failed:', error?.message || error)
            errors.push({
                step: label,
                error: summarizeError(error)
            })
            return undefined
        }
    }

    if([types.MISSION, types.INSTRUMENT, types.SPACECRAFT].includes(type)) {
        const family = await safePrefetch('mission.familyLookup', () => familyLookup(model))
        if(!!family) {
            prefetch.family = family

            const missionLid = family.missions?.[0]?.identifier
            const friendlyMissions = missionLid
                ? await safePrefetch('mission.getFriendlyMissions', () => getFriendlyMissions(family.missions))
                : undefined
            if(friendlyMissions && friendlyMissions.length > 0) {
                prefetch.friendlyMission = friendlyMissions.find(mission => mission.identifier === missionLid) || friendlyMissions[0]
            }

            if(type === types.MISSION && extraPath.length === 0 && prefetch.friendlyMission) {
                const primaryBundle = await safePrefetch('mission.getPrimaryBundleForMission', () => getPrimaryBundleForMission(prefetch.friendlyMission))
                if(primaryBundle !== undefined) {
                    prefetch.primaryBundle = primaryBundle
                }
            }

            if(type === types.INSTRUMENT && extraPath.length === 0) {
                const instrumentDatasets = await safePrefetch('instrument.getDatasetsForInstrument', () => getDatasetsForInstrument(model))
                if(instrumentDatasets !== undefined) {
                    prefetch.instrumentDatasets = instrumentDatasets
                }
                const instrumentPrimaryBundle = await safePrefetch('instrument.getPrimaryBundleForInstrument', () => getPrimaryBundleForInstrument(model))
                if(instrumentPrimaryBundle !== undefined) {
                    prefetch.instrumentPrimaryBundle = instrumentPrimaryBundle
                }
                if(family.instruments && family.spacecraft) {
                    const instrumentSiblings = await safePrefetch('instrument.getFriendlyInstrumentsForSpacecraft', () => getFriendlyInstrumentsForSpacecraft(family.instruments, family.spacecraft))
                    if(instrumentSiblings !== undefined) {
                        prefetch.instrumentSiblings = instrumentSiblings
                    }
                }
            }

            if(type === types.SPACECRAFT && extraPath.length === 0 && family.spacecraft) {
                const spacecraftSiblings = await safePrefetch('spacecraft.getFriendlySpacecraft', () => getFriendlySpacecraft(family.spacecraft))
                if(spacecraftSiblings !== undefined) {
                    prefetch.spacecraftSiblings = spacecraftSiblings
                }
            }

            if(hasSubPath(types.MISSIONTARGETS) && family.targets && missionLid) {
                const missionTargets = await safePrefetch('mission.getFriendlyTargetsForMission', () => getFriendlyTargetsForMission(family.targets, missionLid))
                if(missionTargets !== undefined) {
                    prefetch.missionTargets = missionTargets
                }
            }

            if(hasSubPath(types.MISSIONINSTRUMENTS)) {
                if(family.spacecraft) {
                    const missionSpacecraft = await safePrefetch('mission.getFriendlySpacecraft', () => getFriendlySpacecraft(family.spacecraft))
                    if(missionSpacecraft !== undefined) {
                        prefetch.missionSpacecraft = missionSpacecraft
                    }
                }
                if(family.instruments && family.spacecraft) {
                    const missionInstruments = await safePrefetch('mission.getFriendlyInstrumentsForSpacecraft', () => getFriendlyInstrumentsForSpacecraft(family.instruments, family.spacecraft))
                    if(missionInstruments !== undefined) {
                        prefetch.missionInstruments = missionInstruments
                    }
                }
            }

            if(hasSubPath(types.MOREDATA)) {
                const missionsForMoreData = prefetch.friendlyMission ? [prefetch.friendlyMission] : (family.missions || [])
                const moreDatasets = await safePrefetch('mission.getMoreDatasetsForContext', () => getMoreDatasetsForContext(missionsForMoreData, family.targets || [], contexts.MISSION_MORE_DATA))
                if(moreDatasets !== undefined) {
                    prefetch.moreDatasets = moreDatasets
                    prefetch.moreDatasetCollectionsById = await buildDatasetCollectionsById(moreDatasets, safePrefetch, 'mission.moreDataCollections')
                }
            }
        }
    }

    if(type === types.TARGET) {
        let friendlyTarget = model
        if(!model.logical_identifier) {
            const targets = await safePrefetch('target.getFriendlyTargets', () => getFriendlyTargets([model]))
            if(targets && targets.length > 0) {
                friendlyTarget = targets[0]
            }
        }
        prefetch.friendlyTarget = friendlyTarget

        if(hasSubPath(types.TARGETRELATED)) {
            const relatedTargets = await safePrefetch('target.getRelatedTargetsForTarget', () => getRelatedTargetsForTarget(friendlyTarget))
            if(relatedTargets !== undefined) {
                prefetch.relatedTargets = relatedTargets
            }
        }
        if(hasSubPath(types.TARGETDATA)) {
            const targetDatasets = await safePrefetch('target.getDerivedDatasetsForTarget', () => getDerivedDatasetsForTarget(friendlyTarget))
            if(targetDatasets !== undefined) {
                prefetch.targetDatasets = targetDatasets
                prefetch.targetDatasetCollectionsById = await buildDatasetCollectionsById(targetDatasets, safePrefetch, 'target.derivedDataCollections')
            }
        }

        const needsTargetMissions = hasSubPath(types.TARGETMISSIONS) || hasSubPath(types.MOREDATA)
        if(needsTargetMissions) {
            const targetMissions = await safePrefetch('target.getMissionsForTarget', () => getMissionsForTarget(friendlyTarget))
            if(targetMissions !== undefined) {
                prefetch.targetMissions = targetMissions
            }
        }
        if(hasSubPath(types.MOREDATA)) {
            const missionsForMoreData = prefetch.targetMissions || []
            const moreDatasets = await safePrefetch('target.getMoreDatasetsForContext', () => getMoreDatasetsForContext(missionsForMoreData, [friendlyTarget], contexts.TARGET_MORE_DATA))
            if(moreDatasets !== undefined) {
                prefetch.moreDatasets = moreDatasets
                prefetch.moreDatasetCollectionsById = await buildDatasetCollectionsById(moreDatasets, safePrefetch, 'target.moreDataCollections')
            }
        }
    }

    if([types.BUNDLE, types.COLLECTION].includes(type)) {
        const datasetFamily = await safePrefetch('dataset.familyLookup', () => familyLookup(model))
        if(datasetFamily !== undefined) {
            prefetch.family = datasetFamily

            const missionLid = datasetFamily?.missions?.[0]?.identifier
            if(missionLid && datasetFamily.missions) {
                const friendlyMissions = await safePrefetch('dataset.getFriendlyMissions', () => getFriendlyMissions(datasetFamily.missions))
                if(friendlyMissions && friendlyMissions.length > 0) {
                    prefetch.friendlyMission = friendlyMissions.find(mission => mission.identifier === missionLid) || friendlyMissions[0]
                }
            }
        }
    }

    if(type === types.BUNDLE) {
        const bundleCollections = await safePrefetch('bundle.getCollectionsForDataset', () => getCollectionsForDataset(model))
        if(bundleCollections !== undefined) {
            prefetch.bundleCollections = bundleCollections
        }
    }

    if(type === types.COLLECTION) {
        const collectionBundles = await safePrefetch('collection.getBundlesForCollection', () => getBundlesForCollection(model))
        if(collectionBundles !== undefined) {
            prefetch.collectionBundles = collectionBundles
        }
    }

    return { prefetch, errors }
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

function getLidAndLidvid(doc) {
    const identifier = normalizeIdentifier(doc?.identifier)
    if(!identifier) {
        return null
    }

    try {
        const normalizedIdentifier = identifier.trim().toLowerCase()
        if(!normalizedIdentifier.startsWith('urn:')) {
            return null
        }
        const lid = new LID(normalizedIdentifier).lid
        const version = normalizeVersion(doc.version_id)
        const lidvid = version ? `${lid}::${version}` : lid
        return [lid, lidvid]
    } catch (_) {
        return null
    }
}

function normalizeIdentifier(identifierField) {
    if(Array.isArray(identifierField)) {
        if(identifierField.length === 0) {
            return null
        }
        const first = identifierField[0]
        return typeof first === 'string' ? first : null
    }
    return typeof identifierField === 'string' ? identifierField : null
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

function normalizeSingleValue(field) {
    if(Array.isArray(field)) {
        if(field.length === 0) {
            return null
        }
        return field[0]
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

async function fetchAllCoreTypeDocs() {
    const localSolr = process.env.NEXT_PUBLIC_SUPPLEMENTAL_SOLR || 'https://sbnpds4.psi.edu/solr'
    const endpoint = `${localSolr}/pds-alias/select`
    const rows = 1000
    const docs = []
    let start = 0
    let numFound = Number.POSITIVE_INFINITY

    while(start < numFound) {
        const response = await web.get(endpoint, {
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

        const fromSolr = response?.data
        if(!fromSolr || !fromSolr.response || !Array.isArray(fromSolr.response.docs)) {
            throw new Error('Unable to parse core Solr response while building static paths')
        }

        const pageDocs = fromSolr.response.docs
        docs.push(...pageDocs)

        numFound = Number.parseInt(fromSolr.response.numFound || 0, 10)
        start += pageDocs.length

        if(pageDocs.length === 0) {
            break
        }
    }

    return docs
}

async function buildDatasetCollectionsById(datasets, safePrefetch, labelPrefix) {
    const mapped = {}
    if(!Array.isArray(datasets) || datasets.length === 0) {
        return mapped
    }

    const targets = datasets.filter(dataset => Array.isArray(dataset?.collection_ref) && dataset.collection_ref.length > 0)
    const results = await Promise.all(targets.map(dataset => 
        safePrefetch(`${labelPrefix}:${dataset.identifier}`, () => getCollectionsForDataset(dataset))
            .then(collections => ({ identifier: dataset.identifier, collections }))
    ))

    results.forEach(result => {
        if(result?.collections !== undefined) {
            mapped[result.identifier] = result.collections
        }
    })

    return mapped
}

function summarizeError(error) {
    if(!error) {
        return null
    }
    if(typeof error === 'string') {
        return { message: error }
    }
    return {
        name: error.name || null,
        code: error.code || error.errno || null,
        message: error.message || String(error),
    }
}

function getBuildReportPath() {
    return process.env.STATIC_BUILD_REPORT_PATH || `${process.cwd()}/.next/static-build-report.ndjson`
}

function resetBuildReport() {
    try {
        if(typeof window !== 'undefined') {
            return
        }
        const fs = require('fs')
        const path = require('path')
        const reportPath = getBuildReportPath()
        fs.mkdirSync(path.dirname(reportPath), { recursive: true })
        fs.writeFileSync(reportPath, '', 'utf8')
    } catch (error) {
        console.log('Failed to reset static build report:', error?.message || error)
    }
}

function appendBuildReport(event) {
    try {
        if(typeof window !== 'undefined') {
            return
        }
        const fs = require('fs')
        const path = require('path')
        const reportPath = getBuildReportPath()
        fs.mkdirSync(path.dirname(reportPath), { recursive: true })
        fs.appendFileSync(reportPath, JSON.stringify({
            ts: new Date().toISOString(),
            ...event
        }) + '\n', 'utf8')
    } catch (error) {
        console.log('Failed to append static build report:', error?.message || error)
    }
}

function compactUndefined(value) {
    if(Array.isArray(value)) {
        return value.map(compactUndefined)
    }
    if(value && typeof value === 'object') {
        const output = {}
        Object.entries(value).forEach(([key, child]) => {
            if(child !== undefined) {
                output[key] = compactUndefined(child)
            }
        })
        return output
    }
    return value
}
