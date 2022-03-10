module.exports = {
    webpack: (config) => {
        config.resolve.fallback = { fs:  false, path: false, buffer: false, process: require.resolve("process/browser"), events: require.resolve("events/") }
        return config
 
      },
      
}