export default async function handler(req, res) {
    if(req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    try {
        const scope = req.body?.scope || 'unknown'
        const details = req.body?.details || {}
        const path = req.body?.path || req.headers.referer || 'unknown'
        const ts = req.body?.ts || new Date().toISOString()
        console.warn('[runtime-prefetch-fallback]', JSON.stringify({
            ts,
            scope,
            path,
            details
        }))
        return res.status(204).end()
    } catch (error) {
        return res.status(500).json({ message: error?.message || 'Unable to log fallback' })
    }
}
