const localSolr = (process.env.NODE_ENV === 'production') ? 'https://sbnpds4.psi.edu/solr' : 'http://localhost:1001/http://localhost:8983/solr'
const remoteSolr = (process.env.NODE_ENV === 'production') ? 'https://pds-gamma.jpl.nasa.gov/services/search' : 'http://localhost:1001/https://pds-gamma.jpl.nasa.gov/services/search'

const datasetsCollection = 'web-datasets-alias'
const targetsCollection = 'web-targets-alias'
const instrumentsCollection = 'web-instruments-alias'
const instrumenthostsCollection = 'web-instrumenthosts-alias'
const investigationsCollection = 'web-investigations-alias'
const targetrelationshipsCollection = 'web-targetrelationships-alias'
const coreCollection = 'pds'

export default {
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
}