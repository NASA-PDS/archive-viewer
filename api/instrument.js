import router from 'api/router.js'
import LID from 'services/LogicalIdentifier.js'
import {httpGet, httpGetRelated, httpGetIdentifiers, stitchWithWebFields, initialLookup} from 'api/common.js'
import {stitchWithRelationships, types as relationshipTypes } from 'api/relationships.js'

export function getSpacecraftForInstrument(instrument) {
    let instrumentLid = new LID(instrument.identifier)
    let knownSpacecraft = instrument.instrument_host_ref
    let params = {
        q: `instrument_ref:${instrumentLid.escapedLid}\\:\\:* AND data_class:"Instrument_Host"`,
        fl: 'identifier, title, instrument_ref, target_ref, investigation_ref'
    }
    return httpGetRelated(params, router.spacecraftCore, knownSpacecraft)
        .then(stitchWithWebFields(['display_name', 'image_url'], router.spacecraftWeb))
        .then(stitchWithRelationships(relationshipTypes.fromInstrumentToSpacecraft, instrumentLid))
}

export function getDatasetsForInstrument(instrument) {
    let instrumentLid = new LID(instrument.identifier)

    let params = {
        q: `(instrument_ref:${instrumentLid.escapedLid}\\:\\:* AND product_class:"Product_Bundle")`,
        fl: 'identifier, title, description, instrument_ref, target_ref, instrument_host_ref, collection_ref, collection_type', 
    }
    return httpGet(router.datasetCore, params)
        .then(stitchWithWebFields(['display_name', 'tags'], router.datasetWeb))
        .then(stitchWithRelationships(relationshipTypes.fromInstrumentToBundle, instrumentLid))
}

export function getRelatedInstrumentsForInstrument(instrument, prefetchedSpacecraft) {
    
    if(!!prefetchedSpacecraft) { return gatherInstruments(prefetchedSpacecraft) }

    return new Promise((resolve, reject) => {
        getSpacecraftForInstrument(instrument).then(parent => {
            if(!!parent[0]) {
                gatherInstruments(parent).then(resolve, reject)
            } else {
                reject(new Error("Couldn't find parent object"))
            }
        }, reject)
    })

    function gatherInstruments(spacecraft) {
        return new Promise((resolve, reject) => {
            let childrenLids = spacecraft[0].instrument_ref
            httpGetIdentifiers(router.instrumentsCore, childrenLids)
                .then(stitchWithWebFields(['display_name', 'tags'], router.instrumentsWeb))
                .then(stitchWithRelationships(relationshipTypes.fromSpacecraftToInstrument, new LID(spacecraft[0].identifier)))
                .then(children => {
                    resolve(children.filter(child => child.identifier !== instrument.identifier))
                }, 
            reject)
        })
    }
}

export function getPrimaryBundleForInstrument(instrument) {
    if(!instrument || !instrument.instrument_bundle) { return Promise.resolve(null) }
    return initialLookup(instrument.instrument_bundle)
}