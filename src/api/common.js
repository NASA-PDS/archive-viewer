import web from 'axios';
import desolrize from 'desolrize.js'
import LID from 'services/LogicalIdentifier.js'
import router from 'api/router.js'

const defaultFetchSize = 50
const defaultParameters = () => { return {
    wt: 'json',
    rows: defaultFetchSize,
    start: 0
}}
let fail = msg => Promise.reject(new Error(msg))

// Base-level solr fetch function, that all other functions will eventually call. 
// Recursively fetches all results for a particular Solr query
export function httpGet(endpoint, params, withCount, continuingFrom) {
    const paramsWithDefaultsApplied = Object.assign(defaultParameters(), params)
    continuingFrom = continuingFrom || []
    if(params.q === "") {
        // don't let poorly formed queries through
        return Promise.resolve([])
    }

    return new Promise((resolve, reject) => 
        web.get(endpoint, { params: paramsWithDefaultsApplied }).then(response => {
            let fromSolr = response.data
            
            let docsAvailable = parseInt(fromSolr.response.numFound)
            let currentPosition = parseInt(fromSolr.responseHeader.params.start)
            let docs = fromSolr.response.docs
            let numRemaining = docsAvailable - currentPosition - docs.length
            
            // if this is the only/last batch, desolrize it and return
            if (numRemaining === 0 || (!!params.rows && params.rows !== defaultFetchSize)) {
                let docs = [...continuingFrom, ...desolrize(fromSolr)]
                if(withCount === true) {
                    resolve({
                        count: docsAvailable,
                        docs
                    })
                } else {
                    resolve(docs)
                }
            }
            // otherwise, call the next batch and pass the resolve function down the line
            else {
                paramsWithDefaultsApplied.start = currentPosition + parseInt(paramsWithDefaultsApplied.rows)
                httpGet(endpoint, paramsWithDefaultsApplied, null, [...continuingFrom, ...desolrize(fromSolr)]).then(resolve, reject)
            }
        }, reject)
    )
}

export function httpGetIdentifiers(route, identifiers) {
    if(!identifiers || identifiers.length === 0) return Promise.resolve([])
    let lids = identifiers.constructor === String ? [identifiers] : identifiers
    let params = {
        q: lids.reduce((query, lid) => query + 'identifier:"' + new LID(lid).lid + '" ', ''),
        fl: 'identifier, title'
    }
    return httpGet(route, params)
}

export function httpGetFull(endpoints) {

    if(!endpoints || endpoints.constructor !== Array) fail("Expected array of API calls")
    if(endpoints.length !== 2) fail("Expected only two endpoints to call")

    return new Promise((resolve, reject) => {
        let calls = endpoints.map(endpoint => httpGet(endpoint.url, endpoint.params))
        Promise.all(calls).then(values => {
            let [core, webUI] = values
            if(!core || core.length === 0) {
                reject(new Error(`None found`))
            }
            else if(webUI.length === 1 && core.length === 1) {
                let consolidated = Object.assign({}, core[0])
                resolve(Object.assign(consolidated, webUI[0]))
            } else if (core.length === 1) {
                resolve(core[0])
            } else {
                reject(new Error(`Received unexpected number of results
                
                ${webUI.map(w => w.logical_identifier).join('\n')}
                ${core.map(c => c.lid).join('\n')}
                `))
            }
        }, error => {
            reject(error)
        })
    }).then(stitchWithTools)
}

function stitchWithTools(result) {
    return new Promise((resolve, _) => {
        let tools = result.tools
        if(!tools || tools.length === 0) {
            resolve(result)
        }
        let params = {
            q: tools.reduce((query, lid) => query + 'toolId:"' + lid + '" ', '')
        }
        httpGet(router.tools, params).then(toolLookup => {
            result.tools = toolLookup
            resolve(result)
        }, err => {
            console.log(err)
            // couldn't find tools, so just hide the field
            result.tools = null
            resolve(result)
        })
    })
}

export function httpGetRelated(initialQuery, route, knownLids) {
    return new Promise((resolve, reject) => {
        httpGet(route, initialQuery).then(results => {
            let foundLids = results.map(items => items.identifier)
            if(!knownLids || knownLids.length === 0 || arraysEquivalent(foundLids, knownLids)) {
                // if we have all the referenced items, just return them
                resolve(results)
            } else {
                // otherwise, perform another query to get the other 
                httpGetIdentifiers(route, knownLids).then(otherResults => {
                    // and combine them with the original list
                    let combined = [...results, ...otherResults]
                    resolve(combined.filter((item, index) => combined.findIndex(otherItem => item.identifier === otherItem.identifier) === index))
                }, reject)
            }
        }, reject)
    })
}
function arraysEquivalent(arr1, arr2) {
    return arr1.length === arr2.length && arr1.every((el) => arr2.includes(el))
}


export function stitchWithWebFields(fields, route) {
    if(!fields.includes('logical_identifier')) { fields.push('logical_identifier')}
    return (previousResult) => {
        if(!previousResult || previousResult.length === 0) return new Promise((resolve, _) => { resolve([])})
        
        return new Promise((resolve, _) => {
            let identifiers = previousResult.map(doc => doc.identifier)
            let params = {
                q: identifiers.reduce((query, lid) => query + 'logical_identifier:"' + lid + '" ', ''),
                fl: fields.join()
            }
            httpGet(route, params).then(webDocs => {
                let toReturn = []
                // combine documents by lid
                for (let coreDoc of previousResult ) {
                    let consolidated = Object.assign({}, coreDoc)
                    let corresponding = webDocs.find(webUIdoc => new LID(webUIdoc.logical_identifier).lid === new LID(coreDoc.identifier).lid)
                    if(!!corresponding) {
                        toReturn.push(Object.assign(consolidated, corresponding))
                    } else {
                        toReturn.push(consolidated)
                    }
                }
                resolve(toReturn)
            }, err => {
                //ignore error, just pass original
                resolve(previousResult)
            })
        })
    }
}