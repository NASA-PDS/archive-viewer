import router from 'api/router.js'
import LID from 'services/LogicalIdentifier.js'
import {httpGet, httpGetIdentifiers, stitchWithWebFields} from 'api/common.js'

export function getCollectionsForDataset(dataset) {
    if(!dataset.collection_ref || dataset.collection_ref.length === 0) { return new Promise((resolve, _) => resolve([]))}
    let lids = dataset.collection_ref.map(str => new LID(str).lid)

    let params = {
            fl: 'display_name,logical_identifier,document_flag',
            wt: 'ujson',
            q: lids.reduce((query, lid) => query + `logical_identifier:"${new LID(lid).lidvid}" `, '')
        }
    return new Promise((resolve, reject) => {
        Promise.all([httpGetIdentifiers(router.datasetCore, lids, ['primary_result_purpose']), httpGet(router.datasetWeb, params)]).then(results => {
            let [coreDocs, webDocs] = results 
            if(webDocs.length > 0) {
                let toReturn = []
                // combine documents by lid
                for (let coreDoc of coreDocs ) {
                    let consolidated = Object.assign({}, coreDoc)
                    let corresponding = webDocs.find(webUIdoc => new LID(webUIdoc.logical_identifier).lid === new LID(coreDoc.identifier).lid)
                    toReturn.push(Object.assign(consolidated, corresponding))
                }
                resolve(toReturn)
            } else {
                // can't find matching documents, so just return the results of original query
                resolve(coreDocs)
            }
        })
    })
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