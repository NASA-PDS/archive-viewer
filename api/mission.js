import router from 'api/router.js'
import LID from 'services/LogicalIdentifier.js'
import {httpGetRelated, initialLookup, stitchWithWebFields, httpGet, stitchWithInternalReferences} from 'api/common.js'
import {stitchWithRelationships, types as relationshipTypes } from 'api/relationships.js'
import { contexts, resolveContext } from 'services/pages'

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

export function getFriendlyTargetsForMission(targets, missionLid) {
    return Promise.resolve(targets)
        .then(stitchWithWebFields(['display_name', 'tags', 'image_url', 'display_description'], router.targetsWeb))
        .then(stitchWithRelationships(relationshipTypes.fromMissionToTarget, [missionLid]))
}

export function getDatasetsForMission(mission, spacecraft) {
    const missionQuery = `investigation_ref:${new LID(mission.identifier).escapedLid}\\:\\:*`
    const spacecraftQuery = spacecraft.map(sp => `instrument_host_ref:${new LID(sp.identifier).escapedLid}\\:\\:*`).join(' OR ')
    let params = {
        q: `(product_class:"Product_Bundle" AND (${[missionQuery, spacecraftQuery].filter(el => !!el).join(' OR ')}))`,
    }
    return httpGet(router.datasetCore, params)
        .then(datasets => {
            return Promise.resolve(datasets.filter(bundle => {
                // filter out things that have one instrument
                if (bundle.instrument_ref && bundle.instrument_ref.length === 1) {
                    return false
                }
                // filter out mission bundle
                if (mission.mission_bundle && bundle.identifier === mission.mission_bundle) {
                    return false
                }
                const context = resolveContext(bundle)
                return [contexts.MISSION, contexts.MISSIONANDTARGET, contexts.MISSION_MORE_DATA, contexts.MORE_DATA, contexts.UNKNOWN].includes(context)
            }))
        })
        .then(stitchWithInternalReferences('instrument_ref', router.instrumentsWeb))
        .then(stitchWithWebFields(['display_name', 'tags', 'primary_context'], router.datasetWeb))
}

export function getFriendlyMissions(missions) {
    return Promise.resolve(missions)
        .then(stitchWithWebFields(['display_name', 'tags', 'image_url', 'mission_bundle', 'is_ready', 'other_html'], router.missionsWeb))
}
