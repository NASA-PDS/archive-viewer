export function logPrefetchFallback(scope, details) {
    if(typeof window === 'undefined') {
        return
    }

    const payload = {
        scope,
        details: details || {},
        ts: new Date().toISOString(),
        path: window.location.pathname
    }

    try {
        const body = JSON.stringify(payload)
        if(typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
            const blob = new Blob([body], { type: 'application/json' })
            navigator.sendBeacon('/api/runtime-fallback', blob)
            return
        }

        fetch('/api/runtime-fallback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            keepalive: true
        }).catch(() => undefined)
    } catch (_) {
        // best effort only
    }
}
