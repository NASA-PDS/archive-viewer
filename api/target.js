import router from 'api/router.js'
import LID from 'services/LogicalIdentifier.js'
import {httpGet, httpGetRelated, stitchWithWebFields, httpGetIdentifiers, stitchWithInternalReferences} from 'api/common.js'
import {stitchWithRelationships, types as relationshipTypes } from 'api/relationships.js'
import LogicalIdentifier from 'services/LogicalIdentifier.js'

export function getMissionstForTarget(target) {
    let params = {
        q: `target_ref:${new LID(target.identifier).escapedLid}\\:\\:* AND data_class:"Investigation"`,
        fl: 'identifier, title, instrument_ref, target_ref, instrument_host_ref, investigation_description'
    }
    return httpGetRelated(params, router.missionsCore, [])
        .then(stitchWithWebFields(['display_name', 'tags', 'image_url', 'display_description', 'start_date', 'end_date'], router.missionsWeb))
        .then(stitchWithRelationships(relationshipTypes.fromTargetToMission, [target.identifier]))
}

export function getDatasetsForTarget(target) {
    let targetLid = new LID(target.identifier)

    let params = {
        q: `(target_ref:${targetLid.escapedLid}\\:\\:* AND product_class:"Product_Bundle" AND primary_result_processing_level:Derived AND NOT investigation_ref:*)`,
        // fl: 'identifier, title, instrument_ref, target_ref, instrument_host_ref, investigation_ref'
    }
    return httpGet(router.datasetCore, params)
        .then(stitchWithInternalReferences('instrument_ref', router.instrumentsWeb))
        .then(stitchWithWebFields(['display_name', 'tags'], router.datasetWeb))
}

export function getRelatedTargetsForTarget(target) {
    // for client side requests that are in pds-only mode, skip this step entirely
    if(!!window && new URLSearchParams(window.location.search).get('pdsOnly') === 'true') {
        return Promise.resolve([])
    }

    let targetLid = new LID(target.identifier).lid
    let childrenQuery = httpGet(router.targetRelationships, {
        q: `parent_ref:"${targetLid}"`,
        fl: 'child_ref'
    })
    let parentsQuery = httpGet(router.targetRelationships, {
        q: `child_ref:"${targetLid}"`,
        fl: 'parent_ref'
    })
    let associatedQuery = httpGet(router.targetRelationships, {
        q: `associated_targets:"${targetLid}"`
    })

    return new Promise((resolve, reject) => {
        Promise.all([childrenQuery, parentsQuery, associatedQuery]).then(results => {
            let [children, parents, associated] = results
            let lidMap = {
                children: children.map(c => c.child_ref),
                parents: parents.map(p => p.parent_ref),
                associated: associated.map(a => a.associated_targets.find(ref => ref !== targetLid))
            }
            let allIdentifiers = [...lidMap.children, ...lidMap.parents, ...lidMap.associated]
            httpGetIdentifiers(router.targetsCore, allIdentifiers).then(stitchWithWebFields(['display_name', 'tags', 'image_url'], router.targetsWeb), reject).then(allTargets => {
                let toReturn = [...lidMap.children.map(childLid => allTargets.find(target => target.identifier === childLid)),
                 ...lidMap.parents.map(parentLid => allTargets.find(target => target.identifier === parentLid)),
                 ...lidMap.associated.map(associatedLid => allTargets.find(target => target.identifier === associatedLid))
                ]
                resolve(toReturn)
            }, reject)
        }, reject)
    })
}