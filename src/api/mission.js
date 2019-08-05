import router from 'api/router.js'
import LID from 'services/LogicalIdentifier.js'
import {httpGetFull, httpGetRelated, stitchWithWebFields} from 'api/common.js'

export function lookupMission(lidvid) {
    if(!lidvid) {
        return new Promise((_, reject) => reject(new Error("Expected mission parameter")))
    }
    if(lidvid.constructor === String) {
        lidvid = new LID(lidvid)
    }

    return httpGetFull([
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

export function getSpacecraftForMission(mission) {
    let missionLid = new LID(mission.identifier)
    let knownSpacecraft = mission.instrument_host_ref
    let params = {
        q: `investigation_ref:${missionLid.escapedLid}\\:\\:* AND data_class:"Instrument_Host"`
    }
    return httpGetRelated(params, router.spacecraftCore, knownSpacecraft).then(stitchWithWebFields(['display_name', 'image_url'], router.spacecraftWeb))
}

export function getTargetsForMission(mission) {
    let missionLid = new LID(mission.identifier)
    let knownTargets = mission.target_ref
    let params = {
        q: `investigation_ref:${missionLid.escapedLid}\\:\\:* AND data_class:"Target"`
    }
    return httpGetRelated(params, router.targetsCore, knownTargets).then(stitchWithWebFields(['display_name', 'is_major'], router.targetsWeb))
}