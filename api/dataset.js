import router from 'api/router.js'
import LID from 'services/LogicalIdentifier.js'
import {httpGet, httpGetIdentifiers, stitchWithWebFields} from 'api/common.js'
import {mergeVersionedRecords} from 'services/versionedRecords.js'

export async function getCollectionsForDataset(dataset) {
    const references = dataset.collection_ref || []
    if(references.length === 0) return []
    const lids = [...new Set(references.map(str => new LID(str).lid))]

    let params = {
            fl: 'display_name,logical_identifier,document_flag',
            wt: 'ujson',
            // Fetch all available versions so each source can fall back independently.
            q: lids.map(lid => `logical_identifier:"${new LID(lid).escapedLid}"`).join(' OR ')
        }
    const [coreDocs, webDocs] = await Promise.all([
        httpGetIdentifiers(router.datasetCore, lids, ['version_id', 'primary_result_purpose', 'collection_type']),
        httpGet(router.datasetWeb, params)
    ])
    return mergeVersionedRecords(references, coreDocs, webDocs)
}

export function getBundlesForCollection(dataset) {
    let lid = new LID(dataset.identifier, dataset.version_id)
    let params = {
            wt: 'json',
            q: `product_class:"Product_Bundle" AND collection_ref:"${lid.lidvid}"`,
            fl: 'identifier, title'
        }
    
    return httpGet(router.datasetCore, params).then(stitchWithWebFields(['display_name', 'primary_context', 'dataset_info_url'], router.datasetWeb))
}

export function getTargetsForDataset(dataset) {
    return httpGetIdentifiers(router.targetsCore, dataset.target_ref).then(stitchWithWebFields(['display_name', 'tags'], router.targetsWeb))
}
export function getSpacecraftForDataset(dataset) {
    return httpGetIdentifiers(router.spacecraftCore, dataset.instrument_host_ref).then(stitchWithWebFields(['display_name', 'image_url'], router.spacecraftWeb))
}
export function getMissionsForDataset(dataset) {
    return httpGetIdentifiers(router.missionsCore, dataset.investigation_ref).then(stitchWithWebFields(['display_name', 'image_url'], router.missionsWeb))
}
export function getInstrumentsForDataset(dataset) {
    return httpGetIdentifiers(router.instrumentsCore, dataset.instrument_ref).then(stitchWithWebFields(['display_name', 'tags'], router.instrumentsWeb))
}
