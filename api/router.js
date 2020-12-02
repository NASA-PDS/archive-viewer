const localSolr = (typeof window !== "undefined" ? window.location.origin : 'http://localhost:3000') + '/api/proxy/web'
const remoteSolr = (typeof window !== "undefined" ? window.location.origin : 'http://localhost:3000') + '/api/proxy/core'

const datasetsCollection = 'web-datasets-alias'
const targetsCollection = 'web-targets-alias'
const instrumentsCollection = 'web-instruments-alias'
const instrumenthostsCollection = 'web-instrumenthosts-alias'
const investigationsCollection = 'web-investigations-alias'
const targetrelationshipsCollection = 'web-targetrelationships-alias'
const relationshipsCollection = 'web-objectrelationships-alias'
const toolsCollection = 'web-tools-alias'
const targetSpacecraftRelationshipTypesCollection = 'web-targetspacecraftrelationshiptypes-alias'
const instrumentSpacecraftRelationshipTypesCollection = 'web-instrumentspacecraftrelationshiptypes-alias'
// const coreCollection = 'pds'

export default {
    defaultCore: `${remoteSolr}/search`,
    datasetWeb: `${localSolr}/${datasetsCollection}/select`,
    // datasetCore: `${localSolr}/${coreCollection}/select`,
    datasetCore: `${remoteSolr}/search`,
    targetsWeb: `${localSolr}/${targetsCollection}/select`,
    targetRelationships: `${localSolr}/${targetrelationshipsCollection}/select`,
    targetsCore: `${remoteSolr}/search`,
    instrumentsWeb: `${localSolr}/${instrumentsCollection}/select`,
    instrumentsCore: `${remoteSolr}/search`,
    spacecraftWeb: `${localSolr}/${instrumenthostsCollection}/select`,
    spacecraftCore: `${remoteSolr}/search`,
    missionsWeb: `${localSolr}/${investigationsCollection}/select`,
    missionsCore: `${remoteSolr}/search`,
    relationships: `${localSolr}/${relationshipsCollection}/select`,
    targetSpacecraftRelationshipTypes: `${localSolr}/${targetSpacecraftRelationshipTypesCollection}/select`,
    instrumentSpacecraftRelationshipTypes: `${localSolr}/${instrumentSpacecraftRelationshipTypesCollection}/select`,
    tools: `${localSolr}/${toolsCollection}/select`,
}