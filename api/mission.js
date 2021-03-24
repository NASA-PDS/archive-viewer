import router from 'api/router.js'
import LID from 'services/LogicalIdentifier.js'
import {httpGetRelated, initialLookup, stitchWithWebFields, httpGet, stitchWithInternalReferences} from 'api/common.js'
import {stitchWithRelationships, types as relationshipTypes } from 'api/relationships.js'

export function getSpacecraftForMission(mission) {
    let missionLid = new LID(mission.identifier)
    let knownSpacecraft = mission.instrument_host_ref
    let params = {
        q: `investigation_ref:${missionLid.escapedLid}\\:\\:* AND data_class:"Instrument_Host"`,
        fl: 'identifier, title, instrument_ref, target_ref, investigation_ref'
    }
    return httpGetRelated(params, router.spacecraftCore, knownSpacecraft).then(stitchWithWebFields(['display_name', 'image_url'], router.spacecraftWeb))
}

export function getPrimaryBundleForMission(mission) {
    if(!mission || !mission.mission_bundle) { return Promise.resolve(null) }
    return initialLookup(mission.mission_bundle)
}

export function getTargetsForMission(mission) {
    let missionLid = new LID(mission.identifier)
    let knownTargets = mission.target_ref
    let params = {
        q: `investigation_ref:${missionLid.escapedLid}\\:\\:* AND data_class:"Target"`,
        fl: 'identifier, title'
    }
    return httpGetRelated(params, router.targetsCore, knownTargets)
        .then(stitchWithWebFields(['display_name', 'tags', 'image_url'], router.targetsWeb))
        .then(stitchWithRelationships(relationshipTypes.fromSpacecraftToTarget, new LID(mission.instrument_host_ref[0])))
}

export function getDatasetsForMission(mission, spacecraft, instruments) {
    const missionQuery = `investigation_ref:${new LID(mission.identifier).escapedLid}\\:\\:*`
    const spacecraftQuery = spacecraft.map(sp => `instrument_host_ref:${new LID(sp.identifier).escapedLid}\\:\\:*`).join(' OR ')
    const instrumentQuery = instruments.map(inst => `instrument_ref:${new LID(inst.identifier).escapedLid}\\:\\:*`).join(' OR ')
    let params = {
        q: `(product_class:"Product_Bundle" AND (${[missionQuery, spacecraftQuery, instrumentQuery].join(' OR ')}))`,
    }
    return httpGet(router.datasetCore, params)
        .then(stitchWithInternalReferences('instrument_ref', router.instrumentsWeb))
        .then(stitchWithWebFields(['display_name', 'tags'], router.datasetWeb))
}

export function getFriendlyMissions(missions) {
    return Promise.resolve(missions)
        .then(stitchWithWebFields(['display_name', 'tags', 'image_url'], router.missionsWeb))
}
