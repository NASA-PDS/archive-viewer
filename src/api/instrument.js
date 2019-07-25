import router from 'api/router.js'
import {httpGetAll, httpGet} from 'api/common.js'

export function lookupInstrument(lidvid) {
    let [lid, vid] = lidvid ? lidvid.split('::') : [null,null]
    if(!lid) {
        return new Promise((_, reject) => reject(new Error("Expected instrument parameter")))
    }
    let escapedLid = lid.replace(/:/g, '\\:')

    return httpGetAll([
        {
            url: router.instrumentsCore,
            params: {
                q: `identifier:"${escapedLid}" AND data_class:"Instrument"`,
            }
        },
        {
            url: router.instrumentsWeb,
            params: {
                q: `logical_identifier:"${escapedLid}${vid ? '\\:\\:' + vid : ''}"`
            }
        }
    ])
}