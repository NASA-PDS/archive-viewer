import { Typography } from '@mui/material';
import Breadcrumbs from 'components/Breadcrumbs';
import { TargetGroupedList } from 'components/GroupedList';
import LoadingWrapper from 'components/LoadingWrapper';
import PrimaryLayout from 'components/PrimaryLayout';
import React, { useEffect, useState } from 'react';
import { getFriendlyTargetsForMission } from 'api/mission';
import { logPrefetchFallback } from 'services/prefetchFallbackLog';


export default function MissionTargets(props) {
    const { mission } = props
    const [targets, setTargets] = useState(props.prefetchedTargets || props.targets)

    useEffect(() => {
        if(props.prefetchedTargets) {
            setTargets(props.prefetchedTargets)
            return
        }
        if(!!props.targets) {
            logPrefetchFallback('MissionTargets:getFriendlyTargetsForMission', { identifier: mission?.identifier || null })
            getFriendlyTargetsForMission(props.targets, mission.identifier).then(setTargets, () => setTargets(props.targets))
        }
        return function cleanup() { 
            setTargets(null)
        }
    }, [props.targets, props.prefetchedTargets, mission])

    return (
        <PrimaryLayout primary={
            <>
                <Breadcrumbs currentTitle="Target Derived Data" home={mission}/>
                <Typography variant="h1" >Target Derived Data</Typography>
                <Typography variant="subtitle1" >Higher-order data products related to the target of observation</Typography>
                <LoadingWrapper model={targets}>
                    <TargetGroupedList items={targets} />
                </LoadingWrapper>
            </>
        }/>
    )
}
