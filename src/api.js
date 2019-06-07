import web from 'axios';
import desolrize from 'desolrize.js'

const solrUrl = 'https://sbnpds4.psi.edu/solr/'
const webUICollection = 'sbn'
const coreCollection = 'pds'
const query = 'select'

export function lookupDataset(lidvid) {
    let [lid, vid] = lidvid ? lidvid.split('::') : [null,null]
    if(!lid) {
        return new Promise((_, reject) => reject(new Error("Expected dataset parameter")))
    }
    let escapedLid = lid.replace(/:/g, '\\:')
    let endpoint=`${solrUrl}${webUICollection}/${query}`
    let options = {
        params: {
            fl: '*,[child parentFilter=attrname:dataset]',
            wt: 'ujson',
            q: `logical_identifier:"${escapedLid}${vid ? '\\:\\:' + vid : ''}"`
        }
    }
    
    let webUIPromise = getPromise(endpoint, options)

    endpoint = `${solrUrl}${coreCollection}/${query}`
    options = {
        params: {
            q: `lid:"${escapedLid}"`,
            wt: 'json'
        }
    }

    let corePromise = getPromise(endpoint, options)

    return new Promise((resolve, reject) => {
        Promise.all([webUIPromise, corePromise]).then(values => {
            let [webUI, core] = values
            if(!web || !core) {
                reject(new Error(`Could not find dataset with lidvid ${lidvid}`))
            }
            else if(webUI.length === 1 && core.length === 1) {
                let consolidated = Object.assign({}, webUI[0])
                resolve(Object.assign(consolidated, core[0]))
            } else {
                reject(new Error(`Received unexpected number of results from lidvid ${lidvid}
                
                ${webUI.map(w => w.logical_identifier).join('\n')}
                ${core.map(c => c.lid).join('\n')}
                `))
            }
        }, error => {
            reject(error)
        })
    })
}

export function getCollections(lids) {
    let endpoint=`${solrUrl}${webUICollection}/${query}`
    let options = {
        params: {
            fl: '*,[child parentFilter=attrname:dataset]',
            wt: 'ujson',
            q: lids.reduce((query, lid) => query + "logical_identifier:" + lid.replace(/:/g, '\\:') + ' ', '')
        }
    }
    
    return getPromise(endpoint, options)
}

export function getBundles(lid) {
    let endpoint=`${solrUrl}${coreCollection}/${query}`
    let options = {
        params: {
            wt: 'json',
            q: 'objectType:Product_Bundle +collection_ref:' + lid.replace(/:/g, '\\:')
        }
    }
    
    return getPromise(endpoint, options)
}

function getPromise(endpoint, options) {
    return new Promise((resolve, reject) => 
        web.get(endpoint, options).then(response => resolve(desolrize(response.data)), reject)
    )
}
