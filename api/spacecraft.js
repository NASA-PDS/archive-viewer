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
            fl: 'identifier, title, investigation_description, instrument_host_ref, instrument_ref'
        }
        return httpGetRelated(params, router.missionsCore, knownMissions)
            .then(stitchWithWebFields(['display_name', 'image_url', 'display_description', 'mission_bundle'], router.missionsWeb))
    }
}

export function getFriendlyInstrumentsForSpacecraft(instruments, spacecraft) {
    return Promise.resolve(instruments)
        .then(stitchWithWebFields(['display_name', 'tags'], router.instrumentsWeb))
        .then(stitchWithRelationships(relationshipTypes.fromSpacecraftToInstrument, spacecraft.map(sp => sp.identifier)))
}

export function getInstrumentsForSpacecraft(spacecraft, instruments) {
    return httpGetIdentifiers(router.instrumentsCore, instruments)
        .then(stitchWithWebFields(['display_name', 'tags'], router.instrumentsWeb))
        .then(stitchWithRelationships(relationshipTypes.fromSpacecraftToInstrument, [spacecraft.identifier]))
}

export function getFriendlySpacecraft(siblings) {
    return Promise.resolve(siblings)
        .then(stitchWithWebFields(['display_name', 'tags'], router.spacecraftWeb))
}

export function getSiblingSpacecraft(siblings) {
    return httpGetIdentifiers(router.spacecraftCore, siblings)
        .then(stitchWithWebFields(['display_name', 'tags'], router.spacecraftWeb))
}

export function getDatasetsForSpacecraft(spacecraft) {
    let spacecraftLid = new LID(spacecraft.identifier)

    let params = {
        q: `(instrument_host_ref:${spacecraftLid.escapedLid}\\:\\:* AND product_class:"Product_Bundle" AND NOT instrument_ref:*)`,
        fl: 'identifier, title, instrument_ref, target_ref, instrument_host_ref'
    }
    return httpGet(router.datasetCore, params).then(stitchWithWebFields(['display_name', 'tags'], router.datasetWeb))
}