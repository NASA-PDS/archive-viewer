import router from 'api/router.js'
import LID from 'services/LogicalIdentifier.js'
import {httpGetAll, httpGet} from 'api/common.js'

export function lookupTarget(lidvid) {
    if(!lidvid) {
        return new Promise((_, reject) => reject(new Error("Expected target parameter")))
    }
    if(lidvid.constructor === String) {
        lidvid = new LID(lidvid)
    }

    return httpGetAll([
        {
            url: router.targetsCore,
            params: {
                q: `identifier:"${lidvid.escaped}" AND data_class:"Target"`,
            }
        },
        {
            url: router.targetsWeb,
            params: {
                q: `logical_identifier:"${lidvid.escapedLid}"`
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