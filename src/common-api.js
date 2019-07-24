import web from 'axios';
import desolrize from 'desolrize.js'

export function httpGet(endpoint, params) {
    return new Promise((resolve, reject) => 
        web.get(endpoint, {params}).then(response => resolve(desolrize(response.data)), reject)
    )
}

export function httpGetAll(endpoints) {
    let fail = msg => new Promise((_, reject) => { reject(new Error(msg)) })

    if(!endpoints || endpoints.constructor !== Array) fail("Expected array of endpoints to call")
    if(endpoints.length !== 2) fail("Expected only two endpoints to call")

    return new Promise((resolve, reject) => {
        let calls = endpoints.map(endpoint => httpGet(endpoint.url, endpoint.params))
        console.log(`calling ${endpoints.map(e => e.url + '\n')}`)
        Promise.all(calls).then(values => {
            let [core, webUI] = values
            if(!core) {
                reject(new Error(`None found`))
            }
            else if(webUI.length === 1 && core.length === 1) {
                let consolidated = Object.assign({}, core[0])
                resolve(Object.assign(consolidated, webUI[0]))
            } else {
                reject(new Error(`Received unexpected number of results
                
                ${webUI.map(w => w.logical_identifier).join('\n')}
                ${core.map(c => c.lid).join('\n')}
                `))
            }
        }, error => {
            reject(error)
        })
    })
}