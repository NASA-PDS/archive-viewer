
export const types = {
    MISSION: 'mission',
    TARGET: 'target',
    SPACECRAFT: 'spacecraft',
    INSTRUMENT: 'instrument',
    DATASET: 'dataset'
}

export const resolveType = function(fromSolr) {
    switch (fromSolr.data_class) {
        case "Instrument": return types.INSTRUMENT
        case "Investigation": return types.MISSION
        case "Instrument_Host": return types.SPACECRAFT
        case "Target": return types.TARGET
        default: return types.DATASET
    }
}