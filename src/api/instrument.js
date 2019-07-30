import router from 'api/router.js'
import LID from 'services/LogicalIdentifier.js'
import {httpGetFull, httpGet, httpGetRelated, httpGetIdentifiers} from 'api/common.js'

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
        q: `instrument_ref:*${instrumentLid.lastSegment}* AND data_class:"Instrument_Host"`
    }
    return httpGetRelated(params, router.spacecraftCore, knownSpacecraft)
}

export function getDatasetsForInstrument(instrument) {
    let instrumentLid = new LID(instrument.identifier)

    let params = {
        q: `(instrument_ref:*${instrumentLid.lastSegment}* AND (product_class:"Product_Bundle" OR product_class:"Product_Collection"))`
    }
    return httpGet(router.datasetCore, params)
}

export function getRelatedInstrumentsForInstrument(instrument, prefetchedSpacecraft) {
    
    if(!!prefetchedSpacecraft) { return gatherInstruments(prefetchedSpacecraft) }

    return new Promise((resolve, reject) => {
        getSpacecraftForInstrument(instrument).then(parent => {
            if(!!parent[0] && !!parent[0].instrument_ref) {
                gatherInstruments(parent).then(resolve, reject)
            } else {
                reject(new Error("Couldn't find parent object"))
            }
        }, reject)
    })

    function gatherInstruments(spacecraft) {
        return new Promise((resolve, reject) => {
            let childrenLids = spacecraft[0].instrument_ref
            let params = {
                q: childrenLids.reduce((query, lid) => query + 'identifier:"' + new LID(lid).lid + '" ', '')
            }
            httpGetIdentifiers(router.instrumentsCore, childrenLids).then(children => {
                resolve(children.filter(child => child.identifier !== instrument.identifier))
            }, reject)
        })
    }
}