import { httpGet } from 'api/common.js'
import router from 'api/router.js'

let prefetchedTools

async function bootstrap() {
    return new Promise((resolve, _) => {
        if(!!prefetchedTools) {
            resolve()
        } else {
            const params = {
                q: "*:*"
            }
            httpGet(router.tools, params)
            .then((response) => {
                prefetchedTools = response
                resolve()
            }, resolve)
        }
    })
}

// never reject a promise; if we can't get tool data, just return the input
export function stitchWithTools(result) {
    return new Promise(async (resolve, _) => {
        await bootstrap()
        
        let tools = result.tools
        if(!tools || tools.length === 0) {
            resolve(result)
            return
        }
        if(tools[0].constructor !== Object) {
            tools = tools.map(toolId => { return { toolId }})
        }

        result.tools = tools.map(tool => Object.assign(tool, prefetchedTools.find(lookup => lookup.toolId === tool.toolId)))
        resolve(result)
    })
}
