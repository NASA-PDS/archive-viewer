import router from 'api/router.js'
import {httpGetAll, httpGet} from 'api/common.js'

export function lookupTarget(lidvid) {
    let [lid, vid] = lidvid ? lidvid.split('::') : [null,null]
    if(!lid) {
        return new Promise((_, reject) => reject(new Error("Expected target parameter")))
    }
    let escapedLid = lid.replace(/:/g, '\\:')

    return httpGetAll([
        {
            url: router.targetsCore,
            params: {
                q: `identifier:"${escapedLid}" AND data_class:"Target"`,
            }
        },
        {
            url: router.targetsWeb,
            params: {
                q: `logical_identifier:"${escapedLid}${vid ? '\\:\\:' + vid : ''}"`
            }
        }
    ])
}

export function missionsForTarget(lid) {
    let params = {
        q: `target_ref:"${lid}" AND data_class:"Investigation"`
    }
    return httpGet(router.targetsCore, params)
}

export function datasetsForTarget(lid) {
    let params = {
        q: `(target_ref:"${lid}" AND (product_class:"Product_Bundle" OR product_class:"Product_Collection"))`
    }
    return httpGet(router.targetsCore, params)
}