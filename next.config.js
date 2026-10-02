module.exports = {
    distDir: process.env.NEXT_BUILD_DIR || '.next',
    output: 'standalone',
    turbopack: {},
    webpack: (config) => {
        config.resolve.fallback = { fs: false, path: false, buffer: false, process: require.resolve("process/browser"), events: require.resolve("events/") }
        return config
    },
    compiler: {
        emotion: true
    }
}
