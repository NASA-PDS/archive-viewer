function desolrize(dataset) {
    for(let [key, value] of Object.entries(dataset)) {
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
    return (!keysThatAreActuallyStringArrays.includes(key) && value.constructor === Array && value.length === 1 && value[0].constructor === String)
        || (!keysThatAreActuallyObjectArrays.includes(key) && value.constructor === Array && value.length === 1 && value[0].constructor === Object)
}

const keysThatAreActuallyStringArrays = ['tags']
const keysThatAreActuallyObjectArrays = ['related_tools', 'related_data', 'superseded_data', 'download_packages']

export default function(fromSolr) {
    if(fromSolr.response.docs) {
        if(fromSolr.response.docs.length > 0) {
            return fromSolr.response.docs.map(desolrize)
        } else return null
    } else return null
}
