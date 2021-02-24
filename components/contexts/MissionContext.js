import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { initialLookup } from 'api/common';
import { types } from 'services/pages.js'
import { getMissionsForInstrument } from 'api/instrument';
import { getMissionsForSpacecraft } from 'api/spacecraft';
import { getMissionsForDataset } from 'api/dataset';
import { MissionHeader } from 'components/ContextObjects'
import Instrument from 'components/pages/Instrument';
import Spacecraft from 'components/pages/Spacecraft';
import Mission from 'components/pages/Mission';

const drawerWidth = 360;

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
        display: 'flex'
    }
}));

export default function MissionContext({lidvid, model, type, pdsOnly, mockup}) {
    const [mission, setMission] = useState(null)

    useEffect(() => {
        if(type === types.MISSION) {
            setMission(model)
        } else if(!mission && !!model.investigation_ref && model.investigation_ref.length === 1) {
            initialLookup(model.investigation_ref[0], pdsOnly).then(setMission, console.error)
        }
        else {
            switch(type) {
                case types.INSTRUMENT: getMissionsForInstrument(model).then(missions => setMission(missions && missions.length > 0 ? missions[0] : null), console.error); break;
                case types.SPACECRAFT: getMissionsForSpacecraft(model).then(missions => setMission(missions && missions.length > 0 ? missions[0] : null), console.error); break;
                case types.BUNDLE: 
                case types.COLLECTION: getMissionsForDataset(model).then(missions => setMission(missions && missions.length > 0 ? missions[0] : null), console.error); break;
                default: console.error('unable to determine mission')
            }
        }

        return function cleanup() {
            // don't actually clear the mission here because it will break the illusion
            // setMission(null)
        }
    }, [lidvid])


    const classes = useStyles()

    let mainContent = null
    switch(type) {
        case types.MISSION: mainContent = <Mission lidvid={lidvid} mission={model} pdsOnly={pdsOnly} mockup={mockup}  />; break;
        case types.INSTRUMENT: mainContent = <Instrument lidvid={lidvid} instrument={model} pdsOnly={pdsOnly} mockup={mockup}  />; break;
        case types.SPACECRAFT: mainContent = <Spacecraft lidvid={lidvid} spacecraft={model} pdsOnly={pdsOnly} mockup={mockup} />; break;
        case types.BUNDLE: mainContent = <Bundle lidvid={lidvid} dataset={model} pdsOnly={pdsOnly} mockup={mockup}/>; break;
        case types.COLLECTION: mainContent = <Collection lidvid={lidvid} dataset={model} pdsOnly={pdsOnly} mockup={mockup} />; break;
        default: console.error('unable to determine main content')
    }

    return (
        <div className={classes.root}>
            <MissionHeader type={type} mission={mission} pdsOnly={pdsOnly}/>
            { mainContent }
        </div>
    )
}