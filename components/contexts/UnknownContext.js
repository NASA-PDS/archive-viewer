import { makeStyles } from '@material-ui/core/styles';
import { familyLookup } from 'api/common';
import ErrorMessage from 'components/Error.js';
import { Bundle, Collection } from 'components/pages/Dataset';
import React, { useEffect, useState } from 'react';
import { types } from 'services/pages.js';
import MissionContext from './MissionContext';
import TargetContext from './TargetContext';

const drawerWidth = 360;

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
    }
}));

export default function UnknownContext(props) {
    const {lidvid, model, type, extraPath, ...otherProps} = props
    const [missionFamily, setMissionFamily] = useState(null)
    const [target, setTarget] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        familyLookup(model).then(results => {
            if(results.missions && results.missions.length > 0) { 
                setMissionFamily(results)
            } else if(results.targets && results.targets.length > 0) { 
                setTarget(results.targets[0])
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
    if(!!missionFamily) {
        return <MissionContext family={missionFamily} {...props}/>
    }
    if(!!target) {
        return <TargetContext {...props} />
    }

    // can't figure it out, just show stuff
    if(type === types.BUNDLE) return <Bundle dataset={model} {...props}/>
    if(type === types.COLLECTION) return <Collection dataset={model} {...props}/>

    return <ErrorMessage error={new Error('Unknown')}/>
}