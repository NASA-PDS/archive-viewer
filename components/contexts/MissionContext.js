import { makeStyles } from '@material-ui/core/styles';
import { familyLookup } from 'api/common';
import { getFriendlyMissions } from 'api/mission';
import { MissionHeader } from 'components/ContextObjects';
import ErrorMessage from 'components/Error.js';
import Instrument from 'components/pages/Instrument';
import Mission from 'components/pages/Mission';
import MissionData from 'components/pages/MissionData';
import MissionTargets from 'components/pages/MissionTargets';
import Spacecraft from 'components/pages/Spacecraft';
import React, { useEffect, useState } from 'react';
import { types } from 'services/pages.js';

const drawerWidth = 360;

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
    }
}));

export default function MissionContext(props) {
    const {lidvid, model, type, showTargets, showData, ...otherProps} = props
    const [mission, setMission] = useState(null)
    const [instruments, setInstruments] = useState(null)
    const [spacecraft, setSpacecraft] = useState(null)
    const [targets, setTargets] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        if(type === types.MISSION) {
            setMission(model)
        } 
        familyLookup(model).then(results => {
            if(results.missions && results.missions.length > 0) { 
                let newMissionLid = results.missions[0].identifier
                if(!mission || newMissionLid !== mission.identifier) {
                    setInstruments(results.instruments)
                    setSpacecraft(results.spacecraft)
                    setTargets(results.targets)
                    getFriendlyMissions(results.missions).then(missions => {
                        setMission(missions.find(mission => mission.identifier === newMissionLid))
                    })
                }
            } else {
                setError(new Error("Could not find mission context for LIDVID"))
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


    const classes = useStyles()

    let mainContent = null, tabType = null
    if(!!showTargets) {
        mainContent = <MissionTargets lidvid={lidvid} mission={model} targets={targets} spacecraft={spacecraft} {...otherProps} />
        tabType = 'target'
    } else if(!!showData) {
        mainContent = <MissionData lidvid={lidvid} mission={model} spacecraft={spacecraft} instruments={instruments} {...otherProps} />
        tabType = 'data'
    } else {
        tabType = type
        switch(type) {
            case types.MISSION: mainContent = <Mission lidvid={lidvid} mission={model} {...otherProps}  />; break;
            case types.INSTRUMENT: mainContent = <Instrument lidvid={lidvid} instrument={model} siblings={instruments} spacecraft={spacecraft} {...otherProps}  />; break;
            case types.SPACECRAFT: mainContent = <Spacecraft lidvid={lidvid} spacecraft={model} siblings={spacecraft} instruments={instruments} {...otherProps} />; break;
            case types.BUNDLE: mainContent = <Bundle lidvid={lidvid} dataset={model} {...otherProps}/>; break;
            case types.COLLECTION: mainContent = <Collection lidvid={lidvid} dataset={model} {...otherProps} />; break;
            default: console.error('unable to determine main content')
        }
    }
    return (
        <div className={classes.root}>
            <MissionHeader type={tabType} mission={mission} instruments={instruments} spacecraft={spacecraft} pdsOnly={props.pdsOnly}/>
            { mainContent }
        </div>
    )
}