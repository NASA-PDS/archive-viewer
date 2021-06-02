import { familyLookup } from 'api/context';
import { getBundlesForCollection } from 'api/dataset';
import ErrorMessage from 'components/Error.js';
import { Bundle, Collection } from 'components/pages/Dataset';
import React, { useEffect, useState } from 'react';
import MissionContext from './MissionContext';
import TargetContext from './TargetContext';
import { types, contexts, resolveContext } from 'services/pages'

export default function UnknownContext(props) {
    const {lidvid, model, type, extraPath, ...otherProps} = props
    const [missionFamily, setMissionFamily] = useState(null)
    const [bundles, setBundles] = useState(null)
    const [error, setError] = useState(null)

    let target = null
    if(missionFamily && missionFamily.targets && missionFamily.targets.length > 0) { 
        target = missionFamily.targets[0]
    } 
    
    useEffect(() => {
        familyLookup(model).then(results => {
            if(results.missions && results.missions.length > 0) { 
                setMissionFamily(results)
            } 
        }, setError)
        if(type === types.COLLECTION) {
            getBundlesForCollection(model).then(setBundles, setError)
        }
    }, [lidvid])

    if(!!error) {
        return <ErrorContext error={error} lidvid={lidvid}/>
    }

    const resolvedContext = resolveContext(model, bundles)

    // if dataset can go in either context, present the mission context
    // make sure we're not in the middle of looking up bundles before presenting mission context though
    if((resolvedContext === contexts.MISSION || resolvedContext === contexts.MISSIONANDTARGET)
        && !(type === types.COLLECTION && !bundles)) {
        return <MissionContext family={missionFamily} {...props}/>
    }

    if(resolvedContext === contexts.TARGET && !!target) {
        return <TargetContext target={target} extraPath={extraPath} model={model} type={type} {...otherProps} />
    }

    // Can't figure it out (yet?), just show stuff
    if(type === types.BUNDLE) return <Bundle dataset={model} {...props}/>
    if(type === types.COLLECTION) return <Collection dataset={model} {...props}/>

    return <ErrorContext error={new Error('Unknown')} lidvid={lidvid}/>
}