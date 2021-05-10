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
    MISSIONOTHER: 'missionOther',
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
    [types.MISSIONOTHER]: 'other',
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