import { styled } from '@mui/material/styles';
import { MissionHeader } from 'components/ContextHeaders';
import { Bundle, Collection } from 'components/pages/Dataset.js';
import Instrument from 'components/pages/Instrument';
import Mission from 'components/pages/Mission';
import MoreData from 'components/pages/MoreData';
import MissionInstruments from 'components/pages/MissionInstruments';
import MissionTargets from 'components/pages/MissionTargets';
import MissionTools from 'components/pages/MissionTools';
import Spacecraft from 'components/pages/Spacecraft';
import React, { useEffect, useState } from 'react';
import { pagePaths, types } from 'services/pages.js';
import ErrorContext from './ErrorContext';
import { contexts } from 'services/pages';
import { familyLookup } from 'api/context';
import { logPrefetchFallback } from 'services/prefetchFallbackLog';

const drawerWidth = 360;

const Root = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
}));

export default function MissionContext(props) {
    const {lidvid, model, type, extraPath, ...otherProps} = props
    const prefetch = props.prefetch || {}
    const [family, setFamily] = useState(null)
    const [mission, setMission] = useState(null)
    const [error, setError] = useState(null)
    const [warningDismissed, setWarningDismissed] = useState(false)

    const unpackFamily = results => {
        if(results.missions && results.missions.length > 0) { 
            let newMissionLid = results.missions[0].identifier

            // only change any state if the family has a new mission
            if(!mission || newMissionLid !== mission.identifier) {
                setFamily(results)
                setMission(null)
                setWarningDismissed(false)
                if(prefetch.friendlyMission && prefetch.friendlyMission.identifier === newMissionLid) {
                    setMission(prefetch.friendlyMission)
                } else {
                    setMission(results.missions.find(mission => mission.identifier === newMissionLid) || results.missions[0] || null)
                }
            }
        } else {
            setError(new Error("Could not find mission context for LIDVID"))
        }
    }

    useEffect(() => {
        if(props.disableFamilyLookup && !prefetch.family && !props.family) {
            return
        }

        // use the prefetched family if it's already there
        if(!!prefetch.family) {
            unpackFamily(prefetch.family)
        } else if(!!props.family) {
            unpackFamily(props.family)
        } else {
            logPrefetchFallback('MissionContext:familyLookup', { lidvid, type: model?.data_class || null })
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
            mainContent = <MissionTargets mission={model} targets={targets} prefetchedTargets={prefetch.missionTargets} {...otherProps} />
            pageType = types.MISSIONTARGETS
        } else if(!!extraPath.includes(pagePaths[types.MISSIONINSTRUMENTS])) {
            mainContent = <MissionInstruments mission={model} spacecraft={spacecraft} instruments={instruments} prefetchedFriendlySpacecraft={prefetch.missionSpacecraft} prefetchedFriendlyInstruments={prefetch.missionInstruments} {...otherProps} />
            pageType = types.MISSIONINSTRUMENTS
        } else if(!!extraPath.includes(pagePaths[types.MISSIONTOOLS])) {
            mainContent = <MissionTools mission={model} instruments={instruments} />
            pageType = types.MISSIONTOOLS
        } else if(!!extraPath.includes(pagePaths[types.MOREDATA])) {
            mainContent = <MoreData missions={[model]} targets={targets} context={contexts.MISSION_MORE_DATA} prefetchedDatasets={prefetch.moreDatasets} prefetchedCollectionsById={prefetch.moreDatasetCollectionsById} />
            pageType = types.MOREDATA
        }
    } else {
        pageType = type
        switch(type) {
            case types.MISSION: mainContent = <Mission mission={model} prefetchedPrimaryBundle={prefetch.primaryBundle} {...otherProps}  />; break;
            case types.INSTRUMENT: mainContent = <Instrument instrument={model} siblings={instruments} spacecraft={spacecraft} mission={mission} prefetchedDatasets={prefetch.instrumentDatasets} prefetchedPrimaryBundle={prefetch.instrumentPrimaryBundle} prefetchedFriendlyInstruments={prefetch.instrumentSiblings} {...otherProps}  />; break;
            case types.SPACECRAFT: mainContent = <Spacecraft spacecraft={model} siblings={spacecraft} instruments={instruments} mission={mission} prefetchedFriendlySpacecraft={prefetch.spacecraftSiblings} {...otherProps} />; break;
            case types.BUNDLE: mainContent = <Bundle dataset={model} context={mission} prefetchedCollections={prefetch.bundleCollections} {...otherProps}/>; break;
            case types.COLLECTION: mainContent = <Collection dataset={model} context={mission} prefetchedBundles={prefetch.collectionBundles} {...otherProps} />; break;
            default: console.error('unable to determine main content')
        }
    }

    const headerProps = {lidvid, mission, instruments, spacecraft, instruments, targets, model}
    return (
        <Root>
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
        </Root>
    )
}
