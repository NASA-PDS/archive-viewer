import router from 'api/router.js'
import LID from 'services/LogicalIdentifier.js'
import {httpGetFull, httpGet, httpGetRelated, httpGetIdentifiers, stitchWithWebFields} from 'api/common.js'
import {stitchWithRelationships, types as relationshipTypes } from 'api/relationships.js'

export function lookupInstrument(lidvid) {
    if(!lidvid) {
        return new Promise((_, reject) => reject(new Error("Expected instrument parameter")))
    }
    if(lidvid.constructor === String) {
        lidvid = new LID(lidvid)
    }
    return httpGetFull([
        {
            url: router.instrumentsCore,
            params: {
                q: `identifier:"${lidvid.escaped}" AND data_class:"Instrument"`,
            }
        },
        {
            url: router.instrumentsWeb,
            params: {
                q: `logical_identifier:"${lidvid.escapedLid}"`
            }
        }
    ])
}

export function getSpacecraftForInstrument(instrument) {
    let instrumentLid = new LID(instrument.identifier)
    let knownSpacecraft = instrument.instrument_host_ref
    let params = {
        q: `instrument_ref:${instrumentLid.escapedLid}\\:\\:* AND data_class:"Instrument_Host"`
    }
    return httpGetRelated(params, router.spacecraftCore, knownSpacecraft)
        .then(stitchWithWebFields(['display_name', 'image_url'], router.spacecraftWeb))
        .then(stitchWithRelationships(relationshipTypes.fromInstrumentToSpacecraft, instrumentLid))
}

export function getDatasetsForInstrument(instrument) {
    let instrumentLid = new LID(instrument.identifier)

    let params = {
        q: `(instrument_ref:${instrumentLid.escapedLid}\\:\\:* AND (product_class:"Product_Bundle" OR product_class:"Product_Collection"))`
    }
    return httpGet(router.datasetCore, params)
        .then(stitchWithWebFields(['display_name', 'tags'], router.datasetWeb))
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