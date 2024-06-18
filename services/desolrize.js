function desolrize(dataset) {
    for(let [key, value] of Object.entries(dataset)) {
        if(key.includes(".")) {
            unpackFlattened(dataset, key, value)
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

function unpackFlattened(document, key, value) {
    console.log('unpacking child documents for', value)
    // Extract the category and the field name from the key
    const [category, field] = key.split('.');

    // Initialize the category array if it does not exist
    if (!document[category]) {
        document[category] = [];
    }

    // Iterate over the values and append/update the dictionary
    value.forEach((value, index) => {
        if (document[category][index]) {
            // If the object at this index exists, just add or update the field
            document[category][index][field] = desolrize(value);
        } else {
            // If the object at this index does not exist, create it
            document[category][index] = { [field]: desolrize(value) };
        }
    });
}

const keysThatAreActuallyStringArrays = ['tags', 'target_ref', 'instrument_ref', 'instrument_host_ref', 'investigation_ref', 'collection_ref', 'download_packages', 'superseded_data', 'related_tools', 'related_data', 'collection_type']
const keysThatAreActuallyObjectArrays = ['related_tools', 'related_data', 'superseded_data', 'download_packages']
const keysThatAreAlwaysSingularChildDocuments = ['example', 'publication']
const keysThatAreNeverArrays = ['is_major', 'is_prime', 'order', 'toolId']

export default function desolrizeAll(fromSolr) {
    if(!!fromSolr.response && !!fromSolr.response.docs && fromSolr.response.docs.length > 0) {
        return fromSolr.response.docs.map(desolrize)
    } else return []
}
