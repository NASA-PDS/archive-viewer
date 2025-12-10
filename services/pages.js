import DarkTheme from "DarkTheme"
import LightTheme from "LightTheme"
import * as cookie from 'cookie'

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
    MISSIONBUNDLE: 'missionBundle',
    MOREDATA: 'moreData',
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
    [types.MOREDATA]: 'more',
    [types.TARGETRELATED]: 'related',
    [types.TARGETDATA]: 'data',
    [types.TARGETTOOLS]: 'tools',
    [types.TARGETMISSIONS]: 'missions'
}

export const contexts = {
    // legacy settings
    MISSION: 'mission',
    TARGET: 'target',
    MISSIONANDTARGET: 'both',

    // new settings
    MISSION_INSTRUMENT_DATA: 'mission_instrument_data',
    MISSION_MORE_DATA: 'mission_more_data',
    TARGET_DERIVED_DATA: 'target_derived_data',
    TARGET_MORE_DATA: 'target_more_data',
    MORE_DATA: 'more_data',

    UNKNOWN: 'unknown'
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

export const resolveContext = (dataset, parentBundles) => {
    if(!!dataset.primary_context) {
        if(Object.values(contexts).includes(dataset.primary_context)) {
            return dataset.primary_context
        }
    }

    return contexts.UNKNOWN
}

const themeNames = {
    light: 'light',
    dark: 'dark'
}
const themes = {
    [themeNames.light]: LightTheme,
    [themeNames.dark]: DarkTheme
}

const defaultTheme = themeNames.dark

export function setTheme(props, context) {
    const cookies = cookie.parse(context.req.headers.cookie || '')
    props.themeName = cookies.SBNTHEME || defaultTheme
}
export function getTheme (props) {
    return themes[props.themeName]
}