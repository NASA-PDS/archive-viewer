import router from 'router.js'
import {httpGetAll, httpGet} from 'common-api.js'

export function lookupDataset(lidvid) {
    let [lid, vid] = lidvid ? lidvid.split('::') : [null,null]
    if(!lid) {
        return new Promise((_, reject) => reject(new Error("Expected dataset parameter")))
    }
    let escapedLid = lid.replace(/:/g, '\\:')

    return httpGetAll([
        {
            url: router.datasetCore,
            params: {
                q: `lid:"${escapedLid}"`,
            }
        },
        {
            url: router.datasetWeb,
            params: {
                fl: '*,[child parentFilter=attrname:dataset]',
                wt: 'ujson',
                q: `logical_identifier:"${escapedLid}${vid ? '\\:\\:' + vid : ''}"`
            }
        }
    ])
}

export function getCollections(lids) {
    let params = {
            fl: '*,[child parentFilter=attrname:dataset]',
            wt: 'ujson',
            q: lids.reduce((query, lid) => query + "logical_identifier:" + lid.replace(/:/g, '\\:') + ' ', '')
        }
    
    return httpGet(router.datasetWeb, params)
}

export function getBundles(lid) {
    let params = {
            wt: 'json',
            q: 'objectType:Product_Bundle +collection_ref:' + lid.replace(/:/g, '\\:')
        }
    
    return httpGet(router.datasetCore, params)
}