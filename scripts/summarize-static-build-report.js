#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const reportPath = process.argv[2] || process.env.STATIC_BUILD_REPORT_PATH || path.join(process.cwd(), '.next/static-build-report.ndjson')

if(!fs.existsSync(reportPath)) {
    console.error(`Report not found: ${reportPath}`)
    process.exit(1)
}

const lines = fs.readFileSync(reportPath, 'utf8').split('\n').filter(Boolean)
const events = lines.map(line => {
    try {
        return JSON.parse(line)
    } catch (_) {
        return null
    }
}).filter(Boolean)

const pathEvent = events.find(event => event.phase === 'getStaticPaths')
const propsEvents = events.filter(event => event.phase === 'getStaticProps')
const failedProps = propsEvents.filter(event => event.status !== 'ok')
const prefetchFailures = propsEvents.filter(event => (event.prefetchErrorCount || 0) > 0)

const byCode = new Map()
for (const event of propsEvents) {
    const initialCode = event.initialLookupError?.code || event.initialLookupError?.name
    if(initialCode) {
        byCode.set(initialCode, (byCode.get(initialCode) || 0) + 1)
    }
    for (const failure of event.prefetchErrors || []) {
        const code = failure?.error?.code || failure?.error?.name || 'UNKNOWN'
        byCode.set(code, (byCode.get(code) || 0) + 1)
    }
}

console.log('Static Build Report Summary')
console.log(`Report file: ${reportPath}`)
console.log(`Events: ${events.length}`)
if(pathEvent) {
    console.log(`getStaticPaths docs: ${pathEvent.docs}, parsed: ${pathEvent.parsedIdentifiers}, skipped: ${pathEvent.skippedIdentifiers}, generated paths: ${pathEvent.generatedPaths}`)
}
console.log(`getStaticProps pages: ${propsEvents.length}`)
console.log(`getStaticProps hard failures: ${failedProps.length}`)
console.log(`getStaticProps pages with prefetch errors: ${prefetchFailures.length}`)

if(byCode.size > 0) {
    console.log('\nErrors by code/name:')
    const entries = [...byCode.entries()].sort((a, b) => b[1] - a[1])
    for (const [code, count] of entries) {
        console.log(`- ${code}: ${count}`)
    }
}

if(failedProps.length > 0) {
    console.log('\nSample failed pages:')
    failedProps.slice(0, 20).forEach(event => {
        const msg = event.initialLookupError?.message || 'unknown'
        console.log(`- ${event.path}: ${msg}`)
    })
}

if(prefetchFailures.length > 0) {
    console.log('\nSample prefetch failures:')
    prefetchFailures.slice(0, 20).forEach(event => {
        const sample = (event.prefetchErrors || [])[0]
        console.log(`- ${event.path}: ${sample?.step || 'unknown'} -> ${sample?.error?.message || 'unknown'}`)
    })
}
