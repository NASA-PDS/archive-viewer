import LID from 'services/LogicalIdentifier.js'
import router from 'api/router.js'
import NodeCache from 'node-cache';
import {httpGet, httpGetIdentifiers } from 'api/common'

const desiredFields = [
    'identifier', 
    'title', 
    'data_class', 
    'instrument_ref', 
    'investigation_ref', 
    'instrument_host_ref', 
    'target_ref', 
    'target_description', 
    'alternate_title',
]

const familyCache = new NodeCache()
export function familyLookup(initial) {
    const initialLid = initial.identifier
    
    const cached = familyCache.get(initialLid)
    if(!!cached) {
        return Promise.resolve(cached)
    } else {
        return _familyLookup(initial).then(results => {
            familyCache.set(initialLid, results)
            return Promise.resolve(results)
        })
    }
}

// crawls out two levels from a given context object to discover any other context objects that reference it
function _familyLookup(initial) {

    let toReturn = mergeFamilyResults({
        instruments: [], targets: [], spacecraft: [], missions: []
    }, initial)
    
    return new Promise((resolve, reject) => {
        lookupReferences(initial).then(results => {
            // if there are no results, we're done
            if(!results || results.length === 0) {
                resolve(toReturn)
            }

            // merge and create subsequent requests for any references found by this query
            let requests = []
            results.forEach(result => {                
                mergeFamilyResults(toReturn, result)
                
                requests.push(lookupReferences(result))
            })

            // run all queries and flatten the results
            Promise.all(requests).then((furtherResults) => {
                furtherResults.flat().forEach((otherResult) => mergeFamilyResults(toReturn, otherResult))
            })
            resolve(toReturn)
        }, reject)
    })
}

// get any context objects that are referenced, or reference, a given entity
function lookupReferences(entity) {
    // if it's a target, we don't need to find anything else that references it
    if(entity.data_class === 'Target') {
        return Promise.resolve([])
    }

    const initialLid = new LID(entity.identifier).escapedLid
    
    // lookup anything that references the initial lid
    let queries = [`(instrument_ref:${initialLid}\\:\\:* OR investigation_ref:${initialLid}\\:\\:* OR instrument_host_ref:${initialLid}\\:\\:*)`]

    // also look up anything that references its instruments/spacecraft/missions (but NOT targets)
    extractLidRefs(entity, 'instrument_ref').forEach(lid => { 
        let escaped = new LID(lid).escapedLid
        queries.push(`identifier:"${escaped}"`)
        queries.push(`instrument_ref:${escaped}\\:\\:*`)
    })
    extractLidRefs(entity, 'investigation_ref').forEach(lid => { 
        let escaped = new LID(lid).escapedLid
        queries.push(`identifier:"${escaped}"`)
        queries.push(`investigation_ref:${escaped}\\:\\:*`)
    })
    extractLidRefs(entity, 'instrument_host_ref').forEach(lid => { 
        let escaped = new LID(lid).escapedLid
        queries.push(`identifier:"${escaped}"`)
        queries.push(`instrument_host_ref:${escaped}\\:\\:*`)
    })
    extractLidRefs(entity, 'target_ref').forEach(lid => { 
        let escaped = new LID(lid).escapedLid
        queries.push(`identifier:"${escaped}"`)
    })
    // if there are no target refs, try a lookup by name
    if(!entity.target_ref && !!entity.target_name && !Array.isArray(entity.target_name)) {
        queries.push(`title:"${entity.target_name}" `)
    }

    // split into chunks of 50
    const chunkSize = 50
    let requests = Array(Math.ceil(queries.length / chunkSize)).fill()
        .map((_, index) => index * chunkSize).map(begin => queries.slice(begin, begin + chunkSize))
        .map(queryChunk => {
            const params = {
                q: `data_class:* AND (${queryChunk.join(' OR ')})`,
                fl: desiredFields.join(', ')
            }
            return httpGet(router.defaultCore, params)
        })
    return Promise.all(requests).then(results => results.flat())
}

function extractLidRefs(entity, field) {
    if(!entity[field]) { return [] }

    return entity[field].map(lidvid => new LID(lidvid).lid)
}

function mergeFamilyResults(initial, incoming) {
    let { spacecraft, instruments, targets, missions } = initial
    let ignored = []

    if(!new LID(incoming.identifier).isContextObject) {
        return { spacecraft, instruments, targets, missions, ignored: [incoming.identifier, ...(initial.ignored || [])]}
    }

    const alreadyKnowAboutIt = (destination, addition) => {
        return destination.some(item => item.identifier === addition.identifier)
    }
    const isSuperseded = (destination, addition) => {
        return destination.some(item => item.alternate_title === addition.identifier)
    }

    const insertOrReplace = (destination, addition) => {
        const deprecatedIndex = destination.findIndex(obj => obj.identifier === addition.alternate_title)
        if(deprecatedIndex > -1) { // if supersedes existing
            ignored.push(destination[deprecatedIndex].identifier)
            destination.splice(deprecatedIndex, 1, addition)
        } 
        else if(isSuperseded(destination, addition)) { ignored.push(addition.identifier) }
        else if(!alreadyKnowAboutIt(destination, addition)) { destination.push(addition) } 
    }
    switch (incoming.data_class) {
        case "Instrument_Host": insertOrReplace(spacecraft, incoming); break;
        case "Instrument": insertOrReplace(instruments, incoming); break;
        case "Target": insertOrReplace(targets, incoming); break;
        case "Investigation": insertOrReplace(missions, incoming); break;
        default: ignored.push(incoming.identifier)
    }
    const toReturn = {
        spacecraft, instruments, targets, missions, ignored
    }
    initial.spacecraft = spacecraft
    initial.instruments = instruments
    initial.targets = targets
    initial.missions = missions
    initial.ignored = ignored
    return toReturn
}