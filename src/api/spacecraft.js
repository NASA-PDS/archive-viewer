import router from 'api/router.js'
import {httpGetAll, httpGet} from 'api/common.js'

export function lookupSpacecraft(lidvid) {
    let [lid, vid] = lidvid ? lidvid.split('::') : [null,null]
    if(!lid) {
        return new Promise((_, reject) => reject(new Error("Expected spacecraft parameter")))
    }
    let escapedLid = lid.replace(/:/g, '\\:')

    return httpGetAll([
        {
            url: router.spacecraftCore,
            params: {
                q: `identifier:"${escapedLid}" AND data_class:"Instrument_Host"`,
            }
        },
        {
            url: router.spacecraftWeb,
            params: {
                q: `logical_identifier:"${escapedLid}${vid ? '\\:\\:' + vid : ''}"`
            }
        }
    ])
}