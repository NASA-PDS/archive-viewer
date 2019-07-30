import router from 'api/router.js'
import LID from 'services/LogicalIdentifier.js'
import {httpGetFull, httpGet, httpGetIdentifiers} from 'api/common.js'

export function lookupDataset(lidvid) {
    if(!lidvid) {
        return new Promise((_, reject) => reject(new Error("Expected dataset parameter")))
    }
    if(lidvid.constructor === String) {
        lidvid = new LID(lidvid)
    }

    return httpGetFull([
        {
            url: router.datasetCore,
            params: {
                q: `identifier:"${lidvid.escapedLid}"`,
            }
        },
        {
            url: router.datasetWeb,
            params: {
                fl: '*,[child parentFilter=attrname:dataset]',
                wt: 'ujson',
                q: `logical_identifier:"${lidvid.escaped}"`
            }
        }
    ])
}

export function getCollections(lids) {
    let params = {
            fl: '*,[child parentFilter=attrname:dataset]',
            wt: 'ujson',
            q: lids.reduce((query, lid) => query + "logical_identifier:" + new LID(lid).escapedLid + ' ', '')
        }
    
    return httpGet(router.datasetWeb, params)
}

export function getBundlesForCollection(dataset) {
    let lid = new LID(dataset.logical_identifier)
    let params = {
            wt: 'json',
            q: `product_class:"Product_Bundle" AND collection_ref:"${lid.lidvid}"`
        }
    
    return httpGet(router.datasetCore, params)
}

export function getTargetsForDataset(dataset) {
    return httpGetIdentifiers(router.targetsCore, dataset.target_ref)
}
export function getSpacecraftForDataset(dataset) {
    return httpGetIdentifiers(router.spacecraftCore, dataset.instrument_host_ref)
}
export function getInstrumentsForDataset(dataset) {
    return httpGetIdentifiers(router.instrumentsCore, dataset.instrument_ref)
}