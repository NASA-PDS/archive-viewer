import router from 'api/router.js'
import LID from 'services/LogicalIdentifier.js'
import {httpGetFull, httpGet, httpGetRelated, stitchWithWebFields} from 'api/common.js'
import {stitchWithRelationships, types as relationshipTypes } from 'api/relationships.js'

export function lookupSpacecraft(lidvid) {
    if(!lidvid) {
        return Promise.reject(new Error("Expected spacecraft parameter"))
    }
    if(lidvid.constructor === String) {
        lidvid = new LID(lidvid)
    }

    return httpGetFull([
        {
            url: router.spacecraftCore,
            params: {
                q: `identifier:"${lidvid.escaped}" AND data_class:"Instrument_Host"`,
                fl: 'identifier, title, instrument_ref, target_ref, investigation_ref'
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

export function getMissionsForSpacecraft(spacecraft) {
    let spacecraftLid = new LID(spacecraft.identifier)
    let knownMissions = spacecraft.investigation_ref
    let params = {
        q: `instrument_host_ref:${spacecraftLid.escapedLid}\\:\\:* AND data_class:"Investigation"`,
        fl: 'identifier, title, investigation_description, instrument_host_ref'
    }
    return httpGetRelated(params, router.missionsCore, knownMissions)
        .then(stitchWithWebFields(['display_name', 'image_url', 'display_description'], router.missionsWeb))
}

export function getInstrumentsForSpacecraft(spacecraft) {
    let spacecraftLid = new LID(spacecraft.identifier)
    let knownInstruments = spacecraft.instrument_ref
    let params = {
        q: `instrument_host_ref:${spacecraftLid.escapedLid}\\:\\:* AND data_class:"Instrument"`,
        fl: 'identifier, title, instrument_host_ref'
    }
    return httpGetRelated(params, router.instrumentsCore, knownInstruments)
        .then(stitchWithWebFields(['display_name', 'tags'], router.instrumentsWeb))
        .then(stitchWithRelationships(relationshipTypes.fromSpacecraftToInstrument, spacecraftLid))
}

export function getTargetsForSpacecraft(spacecraft) {
    let spacecraftLid = new LID(spacecraft.identifier)
    let knownTargets = spacecraft.target_ref
    let params = {
        q: `instrument_host_ref:${spacecraftLid.escapedLid}\\:\\:* AND data_class:"Target"`,
        fl: 'identifier, title'
    }
    return httpGetRelated(params, router.targetsCore, knownTargets)
        .then(stitchWithWebFields(['display_name', 'tags'], router.targetsWeb))
        .then(stitchWithRelationships(relationshipTypes.fromSpacecraftToTarget, spacecraftLid))
}

export function getDatasetsForSpacecraft(spacecraft) {
    let spacecraftLid = new LID(spacecraft.identifier)

    let params = {
        q: `(instrument_host_ref:${spacecraftLid.escapedLid}\\:\\:* AND product_class:"Product_Bundle" AND NOT instrument_ref:*)`,
        fl: 'identifier, title, instrument_ref, target_ref, instrument_host_ref'
    }
    return httpGet(router.datasetCore, params).then(stitchWithWebFields(['display_name', 'tags'], router.datasetWeb))
}