import { familyLookup } from 'api/context';
import ErrorMessage from 'components/Error.js';
import { Bundle, Collection } from 'components/pages/Dataset';
import React, { useEffect, useState } from 'react';
import { types } from 'services/pages.js';
import MissionContext from './MissionContext';
import TargetContext from './TargetContext';


export default function UnknownContext(props) {
    const {lidvid, model, type, extraPath, ...otherProps} = props
    const [missionFamily, setMissionFamily] = useState(null)
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

        return function cleanup() {
            // don't actually clear the mission here because it will break the illusion
            // setMission(null)
        }
    }, [lidvid])

    if(!!error) {
        return <ErrorMessage error={error} />
    }

    // Derived data goes to target context
    if(type === types.BUNDLE && model.primary_result_processing_level &&  model.primary_result_processing_level.includes("Derived") && !!target) {
        return <TargetContext target={target} extraPath={extraPath} model={model} type={type} {...otherProps} />
    }
    // Non-derived data goes to mission context
    if(!!missionFamily) {
        return <MissionContext family={missionFamily} {...props}/>
    }

    // can't figure it out, just show stuff
    if(type === types.BUNDLE) return <Bundle dataset={model} {...props}/>
    if(type === types.COLLECTION) return <Collection dataset={model} {...props}/>

    return <ErrorMessage error={new Error('Unknown')}/>
}