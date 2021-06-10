import { Typography } from '@material-ui/core';
import { getFriendlyTargetsForMission } from 'api/mission.js';
import Breadcrumbs from 'components/Breadcrumbs';
import { TargetGroupedList } from 'components/GroupedList';
import LoadingWrapper from 'components/LoadingWrapper';
import PrimaryLayout from 'components/PrimaryLayout';
import React, { useEffect, useState } from 'react';


export default function MissionTargets(props) {
    const { mission } = props
    const [targets, setTargets] = useState(props.targets)

    useEffect(() => {
        if(!!props.targets) getFriendlyTargetsForMission(props.targets, mission.identifier).then(setTargets, console.error)
        return function cleanup() { 
            setTargets(null)
        }
    }, [props.targets])

    return (
        <PrimaryLayout primary={
            <>
                <Breadcrumbs currentTitle="Targets" home={mission}/>
                <Typography variant="h1" gutterBottom>Targets of observation</Typography>
                <LoadingWrapper model={targets}>
                    <TargetGroupedList items={targets} />
                </LoadingWrapper>
            </>
        }/>
    )
}