const { spawn } = require('node:child_process')
const { cpSync } = require('node:fs')
const { resolve } = require('node:path')
const { createSolrFixture } = require('./solr-fixture.cjs')

const fixture = createSolrFixture()
const env = {
    ...process.env,
    NODE_ENV: 'production',
    NEXT_BUILD_DIR: '.next-smoke',
    SUPPLEMENTAL_SOLR: 'http://127.0.0.1:3101/solr',
    NEXT_PUBLIC_SUPPLEMENTAL_SOLR: 'http://127.0.0.1:3101/solr',
    SOLR_USER: 'smoke',
    SOLR_PASS: 'smoke',
    NEXT_TELEMETRY_DISABLED: '1',
}
const next = require.resolve('next/dist/bin/next')
let child
function stop(signal = 'SIGTERM') {
    child?.kill(signal)
    fixture.close()
}
process.on('SIGTERM', () => stop())
process.on('SIGINT', () => stop('SIGINT'))
fixture.on('error', error => {
    console.error(error.message)
    stop()
    process.exitCode = 1
})
function run(args, options = {}) {
    child = spawn(process.execPath, args, { env, stdio: 'inherit', ...options })
    child.on('error', error => {
        console.error(error.message)
        stop()
        process.exitCode = 1
    })
    return child
}
fixture.listen(3101, '127.0.0.1', () => {
    run([next, 'build']).on('exit', (code, signal) => {
        if (code !== 0 || signal) {
            fixture.close()
            process.exitCode = code || 1
            return
        }
        // Match Docker's standalone runtime, including static assets.
        const standalone = resolve('.next-smoke/standalone')
        cpSync('.next-smoke/static', `${standalone}/.next-smoke/static`, { recursive: true })
        cpSync('public', `${standalone}/public`, { recursive: true })
        run([`${standalone}/server.js`], {
            cwd: standalone,
            env: { ...env, HOSTNAME: '127.0.0.1', PORT: '3100' },
        }).on('exit', code => {
            fixture.close()
            process.exitCode = code || 0
        })
    })
})
