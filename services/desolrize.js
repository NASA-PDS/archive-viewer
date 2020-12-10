function desolrize(dataset) {
    for(let [key, value] of Object.entries(dataset)) {
        if(key === '_childDocuments_') {
            unpackChildDocuments(dataset, value)
            delete dataset[key]
            continue
        }
        if(shouldComeOutOfArray(key, value)) {
            dataset[key] = value[0]
        }
        if(dataset[key].constructor === Object) {
            dataset[key] = desolrize(dataset[key])
        }
        if(keysThatAreActuallyObjectArrays.includes(key)) {
            dataset[key] = dataset[key].map( v => desolrize(v))
        } 
    }
    return dataset
}

function shouldComeOutOfArray(key, value) {
    return  value.constructor === Array && 
            value.length === 1 && 
            !keysThatAreActuallyStringArrays.includes(key) && 
            !keysThatAreActuallyObjectArrays.includes(key) &&
            (keysThatAreNeverArrays.includes(key) || value[0].constructor === String || value[0].constructor === Object)
}

function unpackChildDocuments(document, children) {
    for(let child of children) {
        child = desolrize(child) 
        let key = child.attrname
        if(keysThatAreAlwaysSingularChildDocuments.includes(key)) { 
            document[key] = child
        } else if(!document[key]) {
            document[key] = [child]
        } else {
            document[key].push(child)
        }
    }
}

const keysThatAreActuallyStringArrays = ['tags', 'target_ref', 'instrument_ref', 'instrument_host_ref', 'investigation_ref', 'collection_ref', 'download_packages', 'superseded_data', 'related_tools', 'related_data']
const keysThatAreActuallyObjectArrays = ['related_tools', 'related_data', 'superseded_data', 'download_packages']
const keysThatAreAlwaysSingularChildDocuments = ['example', 'publication']
const keysThatAreNeverArrays = ['is_major', 'is_prime', 'order', 'toolId']

export default function desolrizeAll(fromSolr) {
    if(!!fromSolr.response && !!fromSolr.response.docs && fromSolr.response.docs.length > 0) {
        return fromSolr.response.docs.map(desolrize)
    } else return []
}
