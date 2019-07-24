import router from 'router.js'
import {httpGetAll, httpGet} from 'common-api.js'

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
                q: `identifier:"${escapedLid}"`,
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
        q: `(target_ref:"${lid}" +data_class:"Investigation")`
    }
    return httpGet(router.targetsCore, params)
}