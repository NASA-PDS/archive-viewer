module.exports = {
    turbopack: {},
    // Reduces how many SSG page exports run at once per Next worker. Also set
    // SOLR_MAX_CONCURRENCY (e.g. 1–2) in the build env to cap in-flight Solr requests per process.
    experimental: {
        staticGenerationMaxConcurrency: 2,
        staticGenerationMinPagesPerWorker: 40,
    },
    webpack: (config) => {
        config.resolve.fallback = { fs: false, path: false, buffer: false, process: require.resolve("process/browser"), events: require.resolve("events/") }
        return config
    },
    compiler: {
        emotion: true
    }
}