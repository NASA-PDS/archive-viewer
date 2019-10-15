import router from 'api/router.js'
import LID from 'services/LogicalIdentifier.js'
import {httpGetFull, httpGet, httpGetRelated, stitchWithWebFields} from 'api/common.js'
import {stitchWithRelationships, types as relationshipTypes } from 'api/relationships.js'

export function lookupSpacecraft(lidvid) {
    if(!lidvid) {
        return new Promise((_, reject) => reject(new Error("Expected spacecraft parameter")))
    }
    if(lidvid.constructor === String) {
        lidvid = new LID(lidvid)
    }

    return httpGetFull([
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

export function getMissionsForSpacecraft(spacecraft) {
    let spacecraftLid = new LID(spacecraft.identifier)
    let knownMissions = spacecraft.investigation_ref
    let params = {
        q: `instrument_host_ref:${spacecraftLid.escapedLid}\\:\\:* AND data_class:"Investigation"`
    }
    return httpGetRelated(params, router.missionsCore, knownMissions)
        .then(stitchWithWebFields(['display_name', 'image_url', 'display_description'], router.missionsWeb))
}

export function getInstrumentsForSpacecraft(spacecraft) {
    let spacecraftLid = new LID(spacecraft.identifier)
    let knownInstruments = spacecraft.instrument_ref
    let params = {
        q: `instrument_host_ref:${spacecraftLid.escapedLid}\\:\\:* AND data_class:"Instrument"`
    }
    return httpGetRelated(params, router.instrumentsCore, knownInstruments)
        .then(stitchWithWebFields(['display_name', 'is_prime'], router.instrumentsWeb))
        .then(stitchWithRelationships(relationshipTypes.fromSpacecraftToInstrument, spacecraftLid))
}

export function getTargetsForSpacecraft(spacecraft) {
    let spacecraftLid = new LID(spacecraft.identifier)
    let knownTargets = spacecraft.target_ref
    let params = {
        q: `instrument_host_ref:${spacecraftLid.escapedLid}\\:\\:* AND data_class:"Target"`
    }
    return httpGetRelated(params, router.targetsCore, knownTargets)
        .then(stitchWithWebFields(['display_name', 'is_major'], router.targetsWeb))
        .then(stitchWithRelationships(relationshipTypes.fromSpacecraftToTarget, spacecraftLid))
}

export function getDatasetsForSpacecraft(spacecraft) {
    let spacecraftLid = new LID(spacecraft.identifier)

    let params = {
        q: `(instrument_host_ref:${spacecraftLid.escapedLid}\\:\\:* AND (product_class:"Product_Bundle" OR product_class:"Product_Collection"))`
    }
    return httpGet(router.datasetCore, params).then(stitchWithWebFields(['display_name', 'tags'], router.datasetWeb))
}