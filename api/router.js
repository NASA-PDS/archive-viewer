const isServer = typeof window === 'undefined'
const localSolr = process.env.NEXT_PUBLIC_SUPPLEMENTAL_SOLR || 'https://sbnpds4.psi.edu/solr'
const appOrigin = (typeof window !== "undefined" ? window.location.origin : 'http://localhost:3000')

const webProxy = `${appOrigin}/api/proxy/web`
const coreProxy = `${appOrigin}/api/proxy/core`
const heartbeatProxy = `${appOrigin}/api/proxy/heartbeat`
const internalStateProxy = `${appOrigin}/api/proxy/internal`

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

const coreSelect = `${localSolr}/pds-alias/select`
const webSelect = (collection) => `${localSolr}/${collection}/select`

export default {
    heartbeat: isServer ? coreSelect : `${heartbeatProxy}`,
    internal: `${internalStateProxy}`,
    defaultCore: isServer ? coreSelect : `${coreProxy}`,
    datasetWeb: isServer ? webSelect(datasetsCollection) : `${webProxy}/${datasetsCollection}`,
    datasetCore: isServer ? coreSelect : `${coreProxy}`,
    targetsWeb: isServer ? webSelect(targetsCollection) : `${webProxy}/${targetsCollection}`,
    targetRelationships: isServer ? webSelect(targetrelationshipsCollection) : `${webProxy}/${targetrelationshipsCollection}`,
    targetsCore: isServer ? coreSelect : `${coreProxy}`,
    instrumentsWeb: isServer ? webSelect(instrumentsCollection) : `${webProxy}/${instrumentsCollection}`,
    instrumentsCore: isServer ? coreSelect : `${coreProxy}`,
    spacecraftWeb: isServer ? webSelect(instrumenthostsCollection) : `${webProxy}/${instrumenthostsCollection}`,
    spacecraftCore: isServer ? coreSelect : `${coreProxy}`,
    missionsWeb: isServer ? webSelect(investigationsCollection) : `${webProxy}/${investigationsCollection}`,
    missionsCore: isServer ? coreSelect : `${coreProxy}`,
    relationships: isServer ? webSelect(relationshipsCollection) : `${webProxy}/${relationshipsCollection}`,
    targetMissionRelationshipTypes: isServer ? webSelect(targetMissionRelationshipTypesCollection) : `${webProxy}/${targetMissionRelationshipTypesCollection}`,
    instrumentSpacecraftRelationshipTypes: isServer ? webSelect(instrumentSpacecraftRelationshipTypesCollection) : `${webProxy}/${instrumentSpacecraftRelationshipTypesCollection}`,
    tools: isServer ? webSelect(toolsCollection) : `${webProxy}/${toolsCollection}`,
}
