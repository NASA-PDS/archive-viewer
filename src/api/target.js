import router from 'api/router.js'
import LID from 'services/LogicalIdentifier.js'
import {httpGetFull, httpGet, httpGetRelated, stitchWithWebFields} from 'api/common.js'

export function lookupTarget(lidvid) {
    if(!lidvid) {
        return new Promise((_, reject) => reject(new Error("Expected target parameter")))
    }
    if(lidvid.constructor === String) {
        lidvid = new LID(lidvid)
    }

    return httpGetFull([
        {
            url: router.targetsCore,
            params: {
                q: `identifier:"${lidvid.escaped}" AND data_class:"Target"`,
            }
        },
        {
            url: router.targetsWeb,
            params: {
                q: `logical_identifier:"${lidvid.escapedLid}"`
            }
        }
    ])
}

export function getSpacecraftForTarget(target) {
    let targetLid = new LID(target.identifier)
    let params = {
        q: `target_ref:*${targetLid.lastSegment}* AND data_class:"Instrument_Host"`
    }
    return httpGetRelated(params, router.spacecraftCore, []).then(stitchWithWebFields(['display_name', 'image_url'], router.spacecraftWeb))
}

export function getDatasetsForTarget(target) {
    let targetLid = new LID(target.identifier)

    let params = {
        q: `(target_ref:*${targetLid.lastSegment}* AND (product_class:"Product_Bundle" OR product_class:"Product_Collection"))`
    }
    return httpGet(router.datasetCore, params).then(stitchWithWebFields(['display_name', 'tags'], router.datasetWeb))
}