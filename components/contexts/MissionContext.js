import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { familyLookup, initialLookup } from 'api/common';
import { types } from 'services/pages.js'
import { getMissionsForInstrument } from 'api/instrument';
import { getMissionsForSpacecraft } from 'api/spacecraft';
import { getMissionsForDataset } from 'api/dataset';
import { MissionHeader } from 'components/ContextObjects'
import Instrument from 'components/pages/Instrument';
import Spacecraft from 'components/pages/Spacecraft';
import Mission from 'components/pages/Mission';
import MissionTargets from 'components/pages/MissionTargets';

const drawerWidth = 360;

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
    }
}));

export default function MissionContext(props) {
    const {lidvid, model, type, showTargets, ...otherProps} = props
    const [mission, setMission] = useState(null)
    const [instruments, setInstruments] = useState(null)
    const [spacecraft, setSpacecraft] = useState(null)
    const [targets, setTargets] = useState(null)

    useEffect(() => {
        if(type === types.MISSION) {
            setMission(model)
        } 
        familyLookup(model).then(results => {
            setInstruments(results.instruments)
            setSpacecraft(results.spacecraft)
            setTargets(results.targets)
            if(!mission && results.missions && results.missions.length > 0) { 
                initialLookup(results.missions[0]).then(setMission)
            }
        })

        return function cleanup() {
            // don't actually clear the mission here because it will break the illusion
            // setMission(null)
        }
    }, [lidvid])


    const classes = useStyles()

    let mainContent = null
    if(!!showTargets) {
        mainContent = <MissionTargets lidvid={lidvid} mission={model} targets={targets} spacecraft={spacecraft} {...otherProps} />
    } else {
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
            <MissionHeader type={showTargets ? 'target' : type} mission={mission} instruments={instruments} spacecraft={spacecraft} pdsOnly={props.pdsOnly}/>
            { mainContent }
        </div>
    )
}