// const localSolr = 'localhost:8989/solr'
const localSolr = 'https://sbnpds4.psi.edu/solr'
const remoteSolr = (process.env.NODE_ENV === 'production') ? 'https://pds-gamma.jpl.nasa.gov/services/search' : 'http://localhost:1001/https://pds-gamma.jpl.nasa.gov/services/search'

const datasetsCollection = 'web-datasets'
const targetsCollection = 'web-targets-20190806'
const instrumentsCollection = 'web-instruments-20190806'
const instrumenthostsCollection = 'web-instrumenthosts-20190806'
const investigationsCollection = 'web-investigations-20190806'
const targetrelationshipsCollection = 'web-targetrelationships'
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