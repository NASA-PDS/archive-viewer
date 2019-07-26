// const localSolr = 'localhost:8989/solr'
const localSolr = 'https://sbnpds4.psi.edu/solr'
const remoteSolr = 'http://localhost:1001/https://pds.nasa.gov/services/search'

const datasetsCollection = 'web-datasets'
const targetsCollection = 'web-targets'
const instrumentsCollection = 'web-instruments'
const instrumenthostsCollection = 'web-instrumenthosts'
const investigationsCollection = 'web-investigations'
const coreCollection = 'pds'

export default {
    datasetWeb: `${localSolr}/${datasetsCollection}/select`,
    // datasetCore: `${localSolr}/${coreCollection}/select`,
    datasetCore: `${remoteSolr}/search`,
    targetsWeb: `${localSolr}/${targetsCollection}/select`,
    targetsCore: `${remoteSolr}/search`,
    instrumentsWeb: `${localSolr}/${instrumentsCollection}/select`,
    instrumentsCore: `${remoteSolr}/search`,
    spacecraftWeb: `${localSolr}/${instrumenthostsCollection}/select`,
    spacecraftCore: `${remoteSolr}/search`,
    missionsWeb: `${localSolr}/${investigationsCollection}/select`,
    missionsCore: `${remoteSolr}/search`,
}