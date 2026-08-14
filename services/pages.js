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
    // The mission object's mission_bundle LID remains the authoritative link.
    MISSION_BUNDLE: 'mission_bundle',
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

const resolveParentBundleContext = (parentBundles) => {
    const bundleContexts = (parentBundles || [])
        .map(bundle => bundle.primary_context)
        .filter(context => Object.values(contexts).includes(context))

    if(bundleContexts.length > 0) {
        const uniqueContexts = [...new Set(bundleContexts)]
        if(uniqueContexts.length === 1) {
            return uniqueContexts[0]
        }
        if(uniqueContexts.includes(contexts.MISSIONANDTARGET)) {
            return contexts.MISSIONANDTARGET
        }
        if(uniqueContexts.includes(contexts.MORE_DATA)) {
            return contexts.MORE_DATA
        }
        return uniqueContexts[0]
    }

    return null
}

export const resolveContext = (dataset, parentBundles) => {
    const parentBundleContext = resolveParentBundleContext(parentBundles)
    if(resolveType(dataset) === types.COLLECTION) {
        if(parentBundleContext) {
            return parentBundleContext
        }
        if(!!dataset.primary_context && Object.values(contexts).includes(dataset.primary_context)) {
            return dataset.primary_context
        }
        return contexts.UNKNOWN
    }

    if(!!dataset.primary_context) {
        if(Object.values(contexts).includes(dataset.primary_context)) {
            return dataset.primary_context
        }
    }

    if(parentBundleContext) {
        return parentBundleContext
    }

    return contexts.UNKNOWN
}

export const resolveTargetDatasetPage = (dataset, parentBundles) => {
    const context = resolveContext(dataset, parentBundles)
    if([contexts.TARGET_MORE_DATA, contexts.MORE_DATA, contexts.MISSIONANDTARGET].includes(context)) {
        return types.MOREDATA
    }
    return types.TARGETDATA
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
    const requestCookies = context?.req?.headers?.cookie || ''
    const cookies = cookie.parse(requestCookies)
    props.themeName = cookies.SBNTHEME || defaultTheme
}
export function getTheme (props) {
    return themes[props.themeName]
}
