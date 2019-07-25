import router from 'api/router.js'
import LID from 'services/LogicalIdentifier.js'
import {httpGetAll, httpGet} from 'api/common.js'

export function lookupInstrument(lidvid) {
    if(!lidvid) {
        return new Promise((_, reject) => reject(new Error("Expected instrument parameter")))
    }
    if(lidvid.constructor === String) {
        lidvid = new LID(lidvid)
    }
    return httpGetAll([
        {
            url: router.instrumentsCore,
            params: {
                q: `identifier:"${lidvid.escaped}" AND data_class:"Instrument"`,
            }
        },
        {
            url: router.instrumentsWeb,
            params: {
                q: `logical_identifier:"${lidvid.escapedLid}"`
            }
        }
    ])
}