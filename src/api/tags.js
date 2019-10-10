import router from 'api/router.js'
import {TagTypes} from 'components/TagSearch.js'
import {httpGet} from 'api/common.js'


export function lookupTags(tags, type) {
    const routeForTagType = {
        [TagTypes.target]: router.targetsWeb,
        [TagTypes.spacecraft]: router.spacecraftWeb,
        [TagTypes.mission]: router.missionsWeb,
        [TagTypes.instrument]: router.instrumentsWeb
    }

    if(!tags) {
        return new Promise((_, reject) => reject(new Error("Expected list of tags")))
    } 

    let route = routeForTagType[type]
    let params = {
        q: `tags:${tags}`
    }
    return httpGet(route, params)
}