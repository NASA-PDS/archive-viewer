import router from 'api/router.js'
import LID from 'services/LogicalIdentifier.js'
import {httpGetFull, httpGetRelated, stitchWithWebFields} from 'api/common.js'

export function lookupMission(lidvid) {
    if(!lidvid) {
        return Promise.reject(new Error("Expected mission parameter"))
    }
    if(lidvid.constructor === String) {
        lidvid = new LID(lidvid)
    }

    return httpGetFull([
        {
            url: router.missionsCore,
            params: {
                q: `identifier:"${lidvid.escaped}" AND data_class:"Investigation"`,
                fl: 'identifier, title, investigation_description, instrument_host_ref'
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
        q: `investigation_ref:${missionLid.escapedLid}\\:\\:* AND data_class:"Instrument_Host"`,
        fl: 'identifier, title, instrument_ref, target_ref, investigation_ref'
    }
    return httpGetRelated(params, router.spacecraftCore, knownSpacecraft).then(stitchWithWebFields(['display_name', 'image_url'], router.spacecraftWeb))
}

export function getTargetsForMission(mission) {
    let missionLid = new LID(mission.identifier)
    let knownTargets = mission.target_ref
    let params = {
        q: `investigation_ref:${missionLid.escapedLid}\\:\\:* AND data_class:"Target"`,
        fl: 'identifier, title'
    }
    return httpGetRelated(params, router.targetsCore, knownTargets).then(stitchWithWebFields(['display_name', 'tags'], router.targetsWeb))
}