import router from 'api/router.js'
import {httpGetAll, httpGet} from 'api/common.js'

export function lookupMission(lidvid) {
    let [lid, vid] = lidvid ? lidvid.split('::') : [null,null]
    if(!lid) {
        return new Promise((_, reject) => reject(new Error("Expected mission parameter")))
    }
    let escapedLid = lid.replace(/:/g, '\\:')

    return httpGetAll([
        {
            url: router.missionsCore,
            params: {
                q: `identifier:"${escapedLid}" AND data_class:"Investigation"`,
            }
        },
        {
            url: router.missionsWeb,
            params: {
                q: `logical_identifier:"${escapedLid}${vid ? '\\:\\:' + vid : ''}"`
            }
        }
    ])
}