// Harvest's search-core-legacy-4.2.0-SNAPSHOT.jar defines these in
// gov/nasa/pds/search/core/constants/Constants.java. PDSDateConvert substitutes
// them for empty/UNK/N/A/NULL/UNKNOWN values; DocWriter also uses them after
// parsing failures. They indicate an unavailable bound, not a known nilReason.
// Match only the corresponding bound: a stop date in 1965 may be genuine.
const unknownBounds = {
    start: Date.parse('1965-01-01T00:00:00Z'),
    stop: Date.parse('3000-01-01T00:00:00Z')
}

export function parseDisplayDate(value, bound) {
    if(Array.isArray(value)) {
        if(value.length !== 1) return null
        value = value[0]
    }
    if(value == null || value === -1 || typeof value === 'boolean') return null
    if(typeof value === 'string') {
        value = value.trim()
        if(!value || value === '-1') return null
    }
    const date = new Date(value)
    if(!Number.isFinite(date.getTime()) || date.getTime() === unknownBounds[bound]) return null
    return date
}

export function formatDisplayDate(value, includeTime = false, bound) {
    const date = parseDisplayDate(value, bound)
    if(!date) return null
    // Calendar dates should not move to the previous day in western time zones.
    return includeTime ? date.toLocaleString() : date.toLocaleDateString(undefined, { timeZone: 'UTC' })
}
