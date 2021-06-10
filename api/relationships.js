import router from 'api/router.js'
import LID from 'services/LogicalIdentifier.js'
import {httpGet} from 'api/common.js'

export let targetMissionRelationshipTypes
export let instrumentSpacecraftRelationshipTypes
const unknownRelationship = {
    order: 999,
    name: 'Other',
    relationshipId: 'Unknown'
}

async function bootstrap() {
    return new Promise((resolve, reject) => {
        if(!!targetMissionRelationshipTypes && !!instrumentSpacecraftRelationshipTypes) {
            resolve()
        } else {
            const params = {
                q: "*:*", fl: "name,order,relationshipId"
            }
            Promise.all([
                httpGet(router.targetMissionRelationshipTypes, params),
                httpGet(router.instrumentSpacecraftRelationshipTypes, params)
            ])
            .then((response) => {
                targetMissionRelationshipTypes = response[0]
                instrumentSpacecraftRelationshipTypes = response[1]
                resolve()
            }, reject)
        }
    })
}

export const types = {
    fromMissionToTarget: 'fromMissionToTarget',
    fromTargetToMission: 'fromTargetToMission',
    fromInstrumentToSpacecraft: 'fromInstrumentToSpacecraft',
    fromSpacecraftToInstrument: 'fromSpacecraftToInstrument',
    fromInstrumentToBundle: 'fromInstrumentToBundle'
}

const configureForType = (type) => {
    switch (type) {
        case types.fromMissionToTarget: return {
            relationshipTypes: targetMissionRelationshipTypes,
            sourceType: 'investigation',
            relatedType: 'target'
        }
        case types.fromTargetToMission: return {
            relationshipTypes: targetMissionRelationshipTypes,
            sourceType: 'target',
            relatedType: 'investigation'
        }
        case types.fromInstrumentToSpacecraft: return {
            relationshipTypes: instrumentSpacecraftRelationshipTypes,
            sourceType: 'instrument',
            relatedType: 'instrument_host'
        }
        case types.fromSpacecraftToInstrument: return {
            relationshipTypes: instrumentSpacecraftRelationshipTypes,
            sourceType: 'instrument_host',
            relatedType: 'instrument'
        }
        case types.fromInstrumentToBundle: return {
            relationshipTypes: [],
            sourceType: 'instrument',
            relatedType: 'bundle'
        }
        default: console.error("Invalid relationship type")
    }
}

export function stitchWithRelationships(type, sourceLids) {
    return (results) => {
        if(!results || results.length === 0) return Promise.resolve([])
        // for client side requests that are in pds-only mode, skip this step entirely
        if(!!window && new URLSearchParams(window.location.search).get('pdsOnly') === 'true') {
            return Promise.resolve(results)
        }
        return new Promise(async (resolve, _) => {
            // ensure we have the relationship types ready
            await bootstrap()
            let {relationshipTypes, sourceType, relatedType} = configureForType(type)

            let identifiers = results.map(doc => doc.identifier)
            let params = {
                q: `(${sourceLids.map(lid => sourceType + ':' + new LID(lid).escapedLid).join(' OR ')}) AND (` + identifiers.reduce((query, lid) => `${query.length > 0 ? query + " OR ": query}${relatedType}:"${lid}" `, '') + ')',
                fl: `relationshipId,${sourceType},${relatedType},label`
            }
            // get attributed relationships
            httpGet(router.relationships, params).then(webDocs => {
                for (let doc of results ) {
                    // find the relationship for each context object
                    let relationship = webDocs.find(webUIdoc => new LID(webUIdoc[relatedType]).lid === new LID(doc.identifier).lid)
                    if(!relationship) {
                        doc.relatedBy = unknownRelationship
                    } else {
                        // replace relationshipId with the actual relationship type info
                        let relationshipType = relationshipTypes.find(t => t.relationshipId === relationship.relationshipId)
                        Object.assign(relationship, relationshipType ? relationshipType : unknownRelationship)
                        doc.relatedBy = relationship
                    }
                }
                resolve(results)
            }, err => {
                console.log(err)
                //ignore error, throw in unknown relationships and return
                for (let doc of results ) {
                    doc.relatedBy = unknownRelationship
                }
                resolve(results)
            })
        })
    }
}