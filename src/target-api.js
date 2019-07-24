import web from 'axios';
import desolrize from 'desolrize.js'

const solrUrl = 'https://sbnpds4.psi.edu/solr/'
const webUICollection = 'sbn'
const coreCollection = 'pds'
const query = 'select'