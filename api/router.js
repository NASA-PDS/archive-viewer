const webProxy = (typeof window !== "undefined" ? window.location.origin : 'http://localhost:3000') + '/api/proxy/web'
const coreProxy = (typeof window !== "undefined" ? window.location.origin : 'http://localhost:3000') + '/api/proxy/core'
const heartbeatProxy = (typeof window !== "undefined" ? window.location.origin : 'http://localhost:3000') + '/api/proxy/heartbeat'

const datasetsCollection = 'web-datasets-alias'
const targetsCollection = 'web-targets-alias'
const instrumentsCollection = 'web-instruments-alias'
const instrumenthostsCollection = 'web-instrumenthosts-alias'
const investigationsCollection = 'web-investigations-alias'
const targetrelationshipsCollection = 'web-targetrelationships-alias'
const relationshipsCollection = 'web-objectrelationships-alias'
const toolsCollection = 'web-tools-alias'
const targetMissionRelationshipTypesCollection = 'web-targetmissionrelationshiptypes-alias'
const instrumentSpacecraftRelationshipTypesCollection = 'web-instrumentspacecraftrelationshiptypes-alias'
const tagsCollection = 'web-tags-alias'

export default {
    heartbeat: `${heartbeatProxy}`,
    defaultCore: `${coreProxy}`,
    datasetWeb: `${webProxy}/${datasetsCollection}`,
    datasetCore: `${coreProxy}`,
    targetsWeb: `${webProxy}/${targetsCollection}`,
    targetRelationships: `${webProxy}/${targetrelationshipsCollection}`,
    targetsCore: `${coreProxy}`,
    instrumentsWeb: `${webProxy}/${instrumentsCollection}`,
    instrumentsCore: `${coreProxy}`,
    spacecraftWeb: `${webProxy}/${instrumenthostsCollection}`,
    spacecraftCore: `${coreProxy}`,
    missionsWeb: `${webProxy}/${investigationsCollection}`,
    missionsCore: `${coreProxy}`,
    relationships: `${webProxy}/${relationshipsCollection}`,
    targetMissionRelationshipTypes: `${webProxy}/${targetMissionRelationshipTypesCollection}`,
    instrumentSpacecraftRelationshipTypes: `${webProxy}/${instrumentSpacecraftRelationshipTypesCollection}`,
    tools: `${webProxy}/${toolsCollection}`,
    tags: `${webProxy}/${tagsCollection}`,
}