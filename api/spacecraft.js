import router from 'api/router.js'
import LID from 'services/LogicalIdentifier.js'
import {httpGet, httpGetRelated, stitchWithWebFields, httpGetIdentifiers} from 'api/common.js'
import {stitchWithRelationships, types as relationshipTypes } from 'api/relationships.js'


export function getMissionsForSpacecraft(spacecraft) {
    let spacecraftLid = new LID(spacecraft.identifier)

    if(!!spacecraft.mission_override) {
        return httpGetIdentifiers(router.missionsCore, [spacecraft.mission_override])
            .then(stitchWithWebFields(['display_name', 'image_url', 'display_description', 'mission_bundle'], router.missionsWeb))
    } else {
        let knownMissions = spacecraft.investigation_ref
        let params = {
            q: `instrument_host_ref:${spacecraftLid.escapedLid}\\:\\:* AND data_class:"Investigation"`,
            fl: 'identifier, title, investigation_description, instrument_host_ref'
        }
        return httpGetRelated(params, router.missionsCore, knownMissions)
            .then(stitchWithWebFields(['display_name', 'image_url', 'display_description', 'mission_bundle'], router.missionsWeb))
    }
}

export function getInstrumentsForSpacecraft(spacecraft) {
    if(!spacecraft) { return Promise.resolve([])}
    
    let spacecraftLid, knownInstruments
    if(typeof spacecraft === 'string') {
        spacecraftLid = new LID(spacecraft)
        knownInstruments = []
    } else {
        spacecraftLid = new LID(spacecraft.identifier)
        knownInstruments = spacecraft.instrument_ref
    }
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