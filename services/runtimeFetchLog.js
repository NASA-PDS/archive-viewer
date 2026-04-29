export function logRuntimeFetch(scope, step, details) {
    if(typeof window === 'undefined') {
        return
    }
    const payload = details ? ` ${JSON.stringify(details)}` : ''
    console.info(`[runtime-fetch] ${scope}:${step}${payload}`)
}
