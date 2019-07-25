import router from 'api/router.js'
import LID from 'services/LogicalIdentifier.js'
import {httpGetAll, httpGet} from 'api/common.js'

export function lookupSpacecraft(lidvid) {
    if(!lidvid) {
        return new Promise((_, reject) => reject(new Error("Expected spacecraft parameter")))
    }
    if(lidvid.constructor === String) {
        lidvid = new LID(lidvid)
    }

    return httpGetAll([
        {
            url: router.spacecraftCore,
            params: {
                q: `identifier:"${lidvid.escaped}" AND data_class:"Instrument_Host"`,
            }
        },
        {
            url: router.spacecraftWeb,
            params: {
                q: `logical_identifier:"${lidvid.escapedLid}"`
            }
        }
    ])
}