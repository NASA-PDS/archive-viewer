const JOB_RETENTION_MS = 1000 * 60 * 60
const MAX_COMPLETED_JOBS = 100

function getStore() {
    if(!globalThis.__archiveNavigatorRevalidateJobs) {
        globalThis.__archiveNavigatorRevalidateJobs = {
            jobs: new Map(),
            counter: 0,
        }
    }
    return globalThis.__archiveNavigatorRevalidateJobs
}

function nextJobId() {
    const store = getStore()
    store.counter += 1
    return `revalidate-${Date.now()}-${store.counter}`
}

function cloneJob(job) {
    return JSON.parse(JSON.stringify(job))
}

function trimCompletedJobs() {
    const store = getStore()
    const now = Date.now()
    const completed = []

    for (const [jobId, job] of store.jobs.entries()) {
        const finishedAtMs = job.finishedAt ? Date.parse(job.finishedAt) : null
        if(finishedAtMs && now - finishedAtMs > JOB_RETENTION_MS) {
            store.jobs.delete(jobId)
            continue
        }
        if(job.status === 'completed' || job.status === 'failed') {
            completed.push(job)
        }
    }

    if(completed.length <= MAX_COMPLETED_JOBS) {
        return
    }

    completed
        .sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt))
        .slice(0, completed.length - MAX_COMPLETED_JOBS)
        .forEach(job => store.jobs.delete(job.jobId))
}

export function createRevalidateJob(details) {
    const store = getStore()
    const createdAt = new Date().toISOString()
    const job = {
        jobId: nextJobId(),
        createdAt,
        updatedAt: createdAt,
        startedAt: null,
        finishedAt: null,
        status: 'queued',
        mode: details.mode,
        identifier: details.identifier || null,
        identifiers: details.identifiers || (details.identifier ? [details.identifier] : []),
        all: details.all === true,
        concurrency: details.concurrency,
        batchSize: details.batchSize,
        total: null,
        attempted: 0,
        revalidatedPaths: 0,
        failedCount: 0,
        failed: [],
        paths: [],
        planErrors: [],
        currentPath: null,
        currentBatch: 0,
        batchCount: 0,
        error: null,
    }

    store.jobs.set(job.jobId, job)
    trimCompletedJobs()
    return cloneJob(job)
}

export function getRevalidateJob(jobId) {
    const job = getStore().jobs.get(jobId)
    return job ? cloneJob(job) : null
}

export function updateRevalidateJob(jobId, updates) {
    const store = getStore()
    const job = store.jobs.get(jobId)
    if(!job) {
        return null
    }
    job.updatedAt = new Date().toISOString()
    Object.assign(job, updates)
    return cloneJob(job)
}

export function appendRevalidateJobFailures(jobId, failures) {
    const store = getStore()
    const job = store.jobs.get(jobId)
    if(!job) {
        return null
    }
    job.updatedAt = new Date().toISOString()
    job.failed.push(...failures)
    job.failedCount = job.failed.length
    return cloneJob(job)
}
