import web from 'axios';
import desolrize from 'services/desolrize.js'
import LID from 'services/LogicalIdentifier.js'
import router from 'api/router.js'
import { types, resolveType } from 'services/pages.js'
import { stitchWithTools } from './tools';

const defaultFetchSize = 50
const defaultParameters = () => { return {
    wt: 'json',
    rows: defaultFetchSize,
    start: 0
}}

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
            
            if(!fromSolr || !fromSolr.response) {
                reject(new Error("Couldn't parse results"))
                return
            }

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

export function httpGetIdentifiers(route, identifiers, extraFields) {
    if(!identifiers || identifiers.length === 0) return Promise.resolve([])
    let lids = identifiers.constructor === String ? [identifiers] : identifiers
    
    // if we have lots of identifiers, break it into multiple requests (recusrively!!)
    let requests = []
    if (lids.length > defaultFetchSize) {
        requests.push(httpGetIdentifiers(route, lids.slice(defaultFetchSize), extraFields))
        lids = lids.slice(0, defaultFetchSize)
    }

    let params = {
        q: lids.reduce((query, lid) => query + 'identifier:"' + new LID(lid).lid + '" ', ''),
        fl: 'identifier, title' + ( extraFields ? ', ' + extraFields.join(', ') : '')
    }
    requests.push(httpGet(route, params))
    return Promise.all(requests).then(results => results.flat())
}


export function initialLookup(identifier, pdsOnly) {
    let lid = new LID(identifier)
    return new Promise((resolve, reject) => {
        let params = {
            q: `identifier:"${lid.escapedLid}"`
        }
        httpGet(router.defaultCore, params).then(result => {
            if(!result || result.length === 0) {
                reject(new Error(`Nothing found with identifier ${lid.lid}`))
            }
            let doc = Object.assign({}, result[0]);

            // skip supplemental metadata if pdsOnly flag set
            if(pdsOnly) { resolve(doc); return}

            let supplementalRoute, attrname;
            switch (resolveType(doc)) {
                case types.INSTRUMENT: supplementalRoute = router.instrumentsWeb; attrname='instrument'; break;
                case types.MISSION: supplementalRoute = router.missionsWeb; attrname='mission'; break;
                case types.SPACECRAFT: supplementalRoute = router.spacecraftWeb; attrname='spacecraft'; break;
                case types.TARGET: supplementalRoute = router.targetsWeb; attrname='target'; break;
                case types.BUNDLE:
                case types.COLLECTION:
                case types.PDS3:
                    supplementalRoute = router.datasetWeb; attrname='dataset'; break;
                default:
                    supplementalRoute = null
            }

            if(!!supplementalRoute) {
                httpGet(supplementalRoute, {
                    q: `logical_identifier:("${lid.escaped}" OR "${lid.escapedLid}")`,
                    fl: `*,[child parentFilter=attrname:${attrname}]`,
                }).then(result => {
                    if(result.length > 0) {
                        let matchingDoc = result[0]
                        if(result.length > 1) {
                            if(!!lid.vid) {
                                // find the document that matches the lidvid
                                matchingDoc = result.find(r => r.logical_identifier === lid.lidvid)
                            } else {
                                // find the document with the latest version ID
                                try {
                                    const sorted = result.sort((r1, r2) => {
                                        const vid1 = new LID(r1.logical_identifier).vid, vid2 = new LID(r2.logical_identifier).vid
                                        return parseFloat(vid2) - parseFloat(vid1)
                                    })
                                    matchingDoc = sorted[0]
                                } catch(err) {
                                    // just give up
                                    matchingDoc = {}
                                }
                            }
                        }
                        Object.assign(doc, matchingDoc)
                    }
                    resolve(doc)
                }, error => {
                    reject(error)
                })
            } else {
                reject("Unknown document type")
            }
        }, error => {
            reject(error)
        })
    }).then(stitchWithTools)
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

export function stitchWithInternalReferences(fieldName, route) {
    return (previousResult) => {
        if(!previousResult || previousResult.length === 0) return Promise.resolve([])

        const lids = previousResult.map(result => result[fieldName] || []).flat().map(lidvid => new LID(lidvid).lid)

        return new Promise((resolve, _ ) => {
            httpGetIdentifiers(router.defaultCore, lids).then(stitchWithWebFields(['display_name'], route)).then(internalReferences => {
                previousResult.forEach(result => {
                    result[fieldName] = (result[fieldName] || []).map(referenceLid => internalReferences.find(ref => new LID(ref.identifier).lid === new LID(referenceLid).lid ) || referenceLid)
                })
                resolve(previousResult)
            }, () => resolve(previousResult))
        })
    }
}

export function stitchWithWebFields(fields, route) {
    if(!fields.includes('logical_identifier')) { fields.push('logical_identifier')}
    return (previousResult) => {
        if(!previousResult || previousResult.length === 0) return Promise.resolve([])

        // for client side requests that are in pds-only mode, skip this step entirely
        if(!!window && new URLSearchParams(window.location.search).get('pdsOnly') === 'true') {
            return Promise.resolve(previousResult)
        }
            
        // if we have lots of identifiers, break it into multiple requests (recusrively!!)
        let requests = []
        if (previousResult.length > defaultFetchSize) {
            requests.push(stitchWithWebFields(fields, route)(previousResult.slice(defaultFetchSize)))
            previousResult = previousResult.slice(0, defaultFetchSize)
        }
        let identifiers = previousResult.map(doc => doc.identifier)
        
        let params = {
            q: identifiers.reduce((query, lid) => query + 'logical_identifier:"' + lid + '" ', ''),
            fl: fields.join()
        }

        requests.push(httpGet(route, params).then(webDocs => {
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
            return toReturn
        }, err => {
            //ignore error, just pass original
            return previousResult
        }))
        return Promise.all(requests).then(results => results.flat())
    }
}

export function pds3Get(params) {

    let defaultParams = {
        fq: `facet_pds_model_version:"1,pds3" AND facet_type:"1,data_set"`,
        "f.facet_pds_model_version.facet.prefix": '2,pds3,',
        "f.facet_type.facet.prefix:": '2,data_set,',
        fl: 'identifier,title,resLocation',
        rows: 10
    }
    Object.assign(defaultParams, params)

    return httpGet(router.datasetCore, defaultParams, true)
}

export function serviceAvailable() {
    let params = {
        q: '*:*',
        rows: 1
    }
    return new Promise((resolve, reject) => {
            httpGet(router.heartbeat, params).then(results => {
            if(results.length > 0) resolve()
            else reject()
        }, reject)
    })
}