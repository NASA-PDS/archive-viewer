import makeStyles from '@mui/styles/makeStyles';
import { familyLookup } from 'api/context';
import { getFriendlyMissions } from 'api/mission';
import { MissionHeader } from 'components/ContextHeaders';
import { Bundle, Collection } from 'components/pages/Dataset.js';
import Instrument from 'components/pages/Instrument';
import Mission from 'components/pages/Mission';
import MissionData from 'components/pages/MissionData';
import MissionInstruments from 'components/pages/MissionInstruments';
import MissionTargets from 'components/pages/MissionTargets';
import MissionTools from 'components/pages/MissionTools';
import Spacecraft from 'components/pages/Spacecraft';
import React, { useEffect, useState } from 'react';
import { pagePaths, types } from 'services/pages.js';
import ErrorContext from './ErrorContext';

const drawerWidth = 360;

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
    }
}));

export default function MissionContext(props) {
    const {lidvid, model, type, extraPath, ...otherProps} = props
    const [family, setFamily] = useState(null)
    const [mission, setMission] = useState(null)
    const [error, setError] = useState(null)
    const [warningDismissed, setWarningDismissed] = useState(false)
    const classes = useStyles()

    const unpackFamily = results => {
        if(results.missions && results.missions.length > 0) { 
            let newMissionLid = results.missions[0].identifier

            // only change any state if the family has a new mission
            if(!mission || newMissionLid !== mission.identifier) {
                setFamily(results)
                setMission(null)
                setWarningDismissed(false)
                getFriendlyMissions(results.missions).then(missions => {
                    setMission(missions.find(mission => mission.identifier === newMissionLid))
                })
            }
        } else {
            setError(new Error("Could not find mission context for LIDVID"))
        }
    }

    useEffect(() => {
        // use the prefetched family if it's already there
        if(!!props.family) {
            unpackFamily(props.family)
        } else {
            familyLookup(model).then(unpackFamily, setError)
        }

        return function cleanup() {
            // don't actually clear the mission here because it will break the illusion
            // setMission(null)
        }
    }, [lidvid])

    if(!!error) {
        return <ErrorContext error={error} lidvid={lidvid}/>
    }

    const { instruments, spacecraft, targets } = (family || {})

    let mainContent = null, pageType = null
    if(!!extraPath && extraPath.length > 0) {
        if(!!extraPath.includes(pagePaths[types.MISSIONTARGETS])) {
            mainContent = <MissionTargets mission={model} targets={targets} {...otherProps} />
            pageType = types.MISSIONTARGETS
        } else if(!!extraPath.includes(pagePaths[types.MISSIONINSTRUMENTS])) {
            mainContent = <MissionInstruments mission={model} spacecraft={spacecraft} instruments={instruments} {...otherProps} />
            pageType = types.MISSIONINSTRUMENTS
        } else if(!!extraPath.includes(pagePaths[types.MISSIONTOOLS])) {
            mainContent = <MissionTools mission={model} instruments={instruments} />
            pageType = types.MISSIONTOOLS
        } else if(!!extraPath.includes(pagePaths[types.MISSIONOTHER])) {
            mainContent = <MissionData mission={model} spacecraft={spacecraft} />
            pageType = types.MISSIONOTHER
        }
    } else {
        pageType = type
        switch(type) {
            case types.MISSION: mainContent = <Mission mission={model} {...otherProps}  />; break;
            case types.INSTRUMENT: mainContent = <Instrument instrument={model} siblings={instruments} spacecraft={spacecraft} mission={mission} {...otherProps}  />; break;
            case types.SPACECRAFT: mainContent = <Spacecraft spacecraft={model} siblings={spacecraft} instruments={instruments} mission={mission} {...otherProps} />; break;
            case types.BUNDLE: mainContent = <Bundle dataset={model} context={mission} {...otherProps}/>; break;
            case types.COLLECTION: mainContent = <Collection dataset={model} context={mission} {...otherProps} />; break;
            default: console.error('unable to determine main content')
        }
    }

    const headerProps = {lidvid, mission, instruments, spacecraft, instruments, targets, model}
    return (
        <div className={classes.root}>
            <MissionHeader page={pageType} pdsOnly={props.pdsOnly} {...headerProps}/>
            { mainContent }
            {/* <Snackbar open={mission && !mission.is_ready && !warningDismissed} >
                <Alert severity="info" onClose={() => setWarningDismissed(true)} action={
                    <>
                        <Button color="primary" href={"mailto:sbn@psi.edu?subject=Archive%20Browser%20Feedback"} target="_blank">Contact</Button>
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => {
                                setWarningDismissed(true);
                            }}
                            >
                            <CloseIcon fontSize="inherit" />
                        </IconButton>
                    </>
                }>
                    This mission is still being updated, so let us know if you can't find what you're looking for
                </Alert>
            </Snackbar> */}
        </div>
    )
}