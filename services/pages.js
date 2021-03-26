
export const types = {
    MISSION: 'mission',
    TARGET: 'target',
    SPACECRAFT: 'spacecraft',
    INSTRUMENT: 'instrument',
    BUNDLE: 'bundle',
    COLLECTION: 'collection',
    PDS3: 'pds3',
    MISSIONTARGETS: 'missionTargets',
    MISSIONINSTRUMENTS: 'missionInstruments',
    MISSIONTOOLS: 'missionTools',
    MISSIONDATA: 'missionData',
    TARGETRELATED: 'targetRelated',
    TARGETDATA: 'targetData',
    TARGETMISSIONS: 'targetMissions',
    TARGETTOOLS: 'targetTools',
    UNKNOWN: 'unknown'
}

export const pagePaths = {
    [types.MISSIONINSTRUMENTS]: 'instruments',
    [types.MISSIONTARGETS]: 'targets',
    [types.MISSIONTOOLS]: 'tools',
    [types.MISSIONDATA]: 'data',
    [types.TARGETRELATED]: 'related',
    [types.TARGETDATA]: 'data',
    [types.TARGETTOOLS]: 'tools',
    [types.TARGETMISSIONS]: 'missions'
}

export const resolveType = function(fromSolr) {
    if(!!fromSolr.data_class) {
        switch (fromSolr.data_class) {
            case "Instrument": return types.INSTRUMENT
            case "Investigation": return types.MISSION
            case "Instrument_Host": return types.SPACECRAFT
            case "Target": return types.TARGET
            default: break;
        }
    } else {
        switch (fromSolr.objectType) {
            case "Product_Bundle": return types.BUNDLE
            case "Product_Collection": return types.COLLECTION
            case "Product_Data_Set_PDS3": return types.PDS3
            default: break;
        }
    }
    return types.UNKNOWN;
}