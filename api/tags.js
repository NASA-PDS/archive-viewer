import router from 'api/router.js'
import {TagTypes} from 'components/TagSearch.js'
import {httpGet} from 'api/common.js'


export function lookupTags(tags, type) {
    const routeForTagType = {
        [TagTypes.target]: router.targetsWeb,
        [TagTypes.spacecraft]: router.spacecraftWeb,
        [TagTypes.mission]: router.missionsWeb,
        [TagTypes.instrument]: router.instrumentsWeb,
        [TagTypes.dataset]: router.datasetWeb,
    }

    if(!tags || tags.length === 0) {
        return Promise.reject(new Error("Expected list of tags"))
    } 

    let route = routeForTagType[type]
    let params = {
        q: tags.reduce((query, tag) => query + 'tags:"' + tag + '" ', '')
    }
    return httpGet(route, params)
}

export function stitchWithTagGroups(type) {
    return function(results) {
        return new Promise(async (resolve, _) => {

            const tagNames = results?.flatMap(doc => doc.tags || [])
            
            let params = {
                q: `type:"${type}" AND (${tagNames.map(tagName => `name:"${tagName}"`).join(' OR ')})`
            }
            httpGet(router.tags, params).then(tags => {
                results.forEach(result => {
                    result.tags.forEach((tag, index) => {
                        result.tags.splice(index, 1, tags.find(t => t.name === tag) || { name: tag})
                    })
                })
                resolve(results)
            }, err => {
                // ignore error and just reformat
                console.log(err)
                results.forEach(result => {
                    result.tags = result.tags.map(tag => {
                        return { name: tag }
                    })
                })
                resolve(results)
            })
        
        })
    }

}