import router from 'api/router.js'
import LID from 'services/LogicalIdentifier.js'
import {httpGetAll, httpGet} from 'api/common.js'

export function lookupDataset(lidvid) {
    if(!lidvid) {
        return new Promise((_, reject) => reject(new Error("Expected dataset parameter")))
    }
    if(lidvid.constructor === String) {
        lidvid = new LID(lidvid)
    }

    return httpGetAll([
        {
            url: router.datasetCore,
            params: {
                q: `identifier:"${lidvid.escaped}"`,
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
            q: lids.reduce((query, lid) => query + "logical_identifier:" + new LID(lid).escaped + ' ', '')
        }
    
    return httpGet(router.datasetWeb, params)
}

export function getBundles(lid) {
    let params = {
            wt: 'json',
            q: 'objectType:Product_Bundle +collection_ref:' + new LID(lid).escaped
        }
    
    return httpGet(router.datasetCore, params)
}