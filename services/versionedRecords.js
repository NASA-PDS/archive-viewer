import LID from './LogicalIdentifier.js'

const singleValue = value => Array.isArray(value) ? value[0] : value

// PDS versions are dotted integers, not decimal numbers (1.10 > 1.9).
function compareVersions(left, right) {
    const a = String(left || '').split('.')
    const b = String(right || '').split('.')
    for(let i = 0; i < Math.max(a.length, b.length); i++) {
        const av = a[i] || '0'
        const bv = b[i] || '0'
        if(/^\d+$/.test(av) && /^\d+$/.test(bv)) {
            if(BigInt(av) !== BigInt(bv)) return BigInt(av) > BigInt(bv) ? 1 : -1
        } else {
            const order = av.localeCompare(bv, undefined, { numeric: true })
            if(order !== 0) return order
        }
    }
    return 0
}

/** Index once per batch: exact and latest selection are then constant-time. */
export function createVersionedRecordLookup(records, identifierField = 'identifier') {
    const byLid = new Map()
    for(const record of records) {
        const identifier = singleValue(record[identifierField])
        if(typeof identifier !== 'string' || !identifier.startsWith('urn:')) continue
        const candidate = new LID(identifier)
        const version = candidate.vid || singleValue(record.version_id)
        let group = byLid.get(candidate.lid)
        if(!group) {
            group = { versions: new Map(), latest: undefined, latestVersion: undefined }
            byLid.set(candidate.lid, group)
        }
        if(version && !group.versions.has(String(version))) group.versions.set(String(version), record)
        if(!group.latest || (version && !group.latestVersion) || compareVersions(version, group.latestVersion) > 0) {
            group.latest = record
            group.latestVersion = version
        }
    }
    return reference => {
        const requested = new LID(reference)
        const group = byLid.get(requested.lid)
        return group && ((requested.vid && group.versions.get(requested.vid)) || group.latest)
    }
}

/** Select the requested version, or the latest available record for its LID. */
export function selectVersionedRecord(records, reference, identifierField = 'identifier') {
    return createVersionedRecordLookup(records, identifierField)(reference)
}

/** Core and supplemental versions fall back independently for each reference. */
export function mergeVersionedRecords(references, coreDocs, webDocs) {
    const findCore = createVersionedRecordLookup(coreDocs)
    const findSupplemental = createVersionedRecordLookup(webDocs, 'logical_identifier')
    return [...new Set(references)].flatMap(reference => {
        const core = findCore(reference)
        // Supplemental metadata alone does not establish a registered product.
        if(!core) return []
        const supplemental = findSupplemental(reference)
        return [{ ...core, ...supplemental }]
    })
}
