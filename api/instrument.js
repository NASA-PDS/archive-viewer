import router from 'api/router.js'
import LID from 'services/LogicalIdentifier.js'
import {httpGet, httpGetRelated, httpGetIdentifiers, stitchWithWebFields, initialLookup} from 'api/common.js'
import {stitchWithRelationships, types as relationshipTypes } from 'api/relationships.js'
import { getMissionsForSpacecraft } from './spacecraft'


export function getMissionsForInstrument(instrument) {
    let instrumentLid = new LID(instrument.identifier)

    if(!!instrument.mission_override) {
        return httpGetIdentifiers(router.missionsCore, [instrument.mission_override])
            .then(stitchWithWebFields(['display_name', 'image_url', ], router.missionsWeb))
    } else {
        let knownMissions = instrument.investigation_ref
        let params = {
            q: `instrument_ref:${instrumentLid.escapedLid}\\:\\:* AND data_class:"Investigation"`,
            fl: 'identifier, title, instrument_ref, instrument_host_ref'
        }
        return httpGetRelated(params, router.missionsCore, knownMissions)
            .then(results => {
                if(!results || results.length === 0) {
                    return getSpacecraftForInstrument(instrument).then(results => {
                        if(!!results && results.length > 0) { return getMissionsForSpacecraft(results[0]) }
                        return Promise.resolve([])
                    })
                }
                else {
                    return stitchWithWebFields(['display_name', 'image_url'], router.missionsWeb)(results)
                }
            })
    }
}

export function getSpacecraftForInstrument(instrument) {
    let knownSpacecraft = instrument.instrument_host_ref
    let params = {
        q: `instrument_ref:${new LID(instrument.identifier).escapedLid}\\:\\:* AND data_class:"Instrument_Host"`,
        fl: 'identifier, title, instrument_ref, target_ref, investigation_ref'
    }
    return httpGetRelated(params, router.spacecraftCore, knownSpacecraft)
        .then(stitchWithWebFields(['display_name', 'image_url'], router.spacecraftWeb))
        .then(stitchWithRelationships(relationshipTypes.fromInstrumentToSpacecraft, [instrument.identifier]))
}

export function getDatasetsForInstrument(instrument) {

    let params = {
        q: `(instrument_ref:${new LID(instrument.identifier).escapedLid}\\:\\:* AND product_class:"Product_Bundle")`,
        fl: 'identifier, title, description, instrument_ref, target_ref, instrument_host_ref, collection_ref, collection_type', 
    }
    return httpGet(router.datasetCore, params)
        .then(stitchWithWebFields(['display_name', 'tags'], router.datasetWeb))
        .then(stitchWithRelationships(relationshipTypes.fromInstrumentToBundle, [instrument.identifier]))
}

export function getSiblingInstruments(siblings, spacecraft) {
    return httpGetIdentifiers(router.instrumentsCore, siblings)
        .then(stitchWithWebFields(['display_name', 'tags'], router.instrumentsWeb))
        .then(stitchWithRelationships(relationshipTypes.fromSpacecraftToInstrument, spacecraft))
}

export function getPrimaryBundleForInstrument(instrument) {
    if(!instrument || !instrument.instrument_bundle) { return Promise.resolve(null) }
    return initialLookup(instrument.instrument_bundle)
}