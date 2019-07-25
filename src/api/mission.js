import router from 'api/router.js'
import LID from 'services/LogicalIdentifier.js'
import {httpGetAll, httpGet} from 'api/common.js'

export function lookupMission(lidvid) {
    if(!lidvid) {
        return new Promise((_, reject) => reject(new Error("Expected mission parameter")))
    }
    if(lidvid.constructor === String) {
        lidvid = new LID(lidvid)
    }

    return httpGetAll([
        {
            url: router.missionsCore,
            params: {
                q: `identifier:"${lidvid.escaped}" AND data_class:"Investigation"`,
            }
        },
        {
            url: router.missionsWeb,
            params: {
                q: `logical_identifier:"${lidvid.escapedLid}"`
            }
        }
    ])
}