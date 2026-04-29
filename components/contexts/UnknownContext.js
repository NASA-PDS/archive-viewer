import { Bundle, Collection } from 'components/pages/Dataset';
import React, { useEffect, useState } from 'react';
import MissionContext from './MissionContext';
import TargetContext from './TargetContext';
import { types, contexts, resolveContext } from 'services/pages'
import ErrorContext from './ErrorContext';
import { familyLookup } from 'api/context';
import { getBundlesForCollection } from 'api/dataset';
import { logPrefetchFallback } from 'services/prefetchFallbackLog';

export default function UnknownContext(props) {
    const {lidvid, model, type, extraPath, ...otherProps} = props
    const prefetch = props.prefetch || {}
    const [missionFamily, setMissionFamily] = useState(prefetch.family || null)
    const [bundles, setBundles] = useState(prefetch.collectionBundles || null)
    const [error, setError] = useState(null)

    let target = null
    if(missionFamily && missionFamily.targets && missionFamily.targets.length > 0) { 
        target = missionFamily.targets[0]
    } 
    
    useEffect(() => {
        if(prefetch.family) {
            setMissionFamily(prefetch.family)
        } else {
            logPrefetchFallback('UnknownContext:familyLookup', { identifier: model?.identifier || null })
            familyLookup(model).then(setMissionFamily, setError)
        }
        if(type === types.COLLECTION) {
            if(prefetch.collectionBundles) {
                setBundles(prefetch.collectionBundles)
            } else {
                logPrefetchFallback('UnknownContext:getBundlesForCollection', { identifier: model?.identifier || null })
                getBundlesForCollection(model).then(setBundles, setError)
            }
        }
    }, [lidvid, prefetch.family, prefetch.collectionBundles, model, type])

    if(!!error) {
        return <ErrorContext error={error} lidvid={lidvid}/>
    }

    const resolvedContext = resolveContext(model, bundles)

    // if dataset can go in either context, present the mission context
    // make sure we're not in the middle of looking up bundles before presenting mission context though
    if([contexts.MISSION, contexts.MISSIONANDTARGET, contexts.UNKNOWN, contexts.MISSION_INSTRUMENT_DATA, contexts.MISSION_MORE_DATA].includes(resolvedContext)
        && !(type === types.COLLECTION && !bundles)) {
        return <MissionContext family={missionFamily} disableFamilyLookup={true} {...props}/>
    }

    if(!!target && [contexts.TARGET, contexts.TARGET_DERIVED_DATA, contexts.TARGET_MORE_DATA].includes(resolvedContext)) {
        return <TargetContext target={target} extraPath={extraPath} model={model} type={type} {...otherProps} />
    }

    // Can't figure it out (yet?), just show stuff
    if(type === types.BUNDLE) return <Bundle dataset={model} prefetchedCollections={prefetch.bundleCollections} {...props}/>
    if(type === types.COLLECTION) return <Collection dataset={model} prefetchedBundles={prefetch.collectionBundles} {...props}/>

    return <ErrorContext error={new Error('Unknown')} lidvid={lidvid}/>
}
