import { Typography } from '@mui/material';
import Breadcrumbs from 'components/Breadcrumbs';
import { MissionGroupedList } from 'components/GroupedList';
import LoadingWrapper from 'components/LoadingWrapper';
import PrimaryLayout from 'components/PrimaryLayout';
import React, { useEffect, useState } from 'react';
import { getMissionsForTarget } from 'api/target';
import { logPrefetchFallback } from 'services/prefetchFallbackLog';

export default function TargetMissions(props) {
    const { target } = props
    const [missions, setMissions] = useState(props.prefetchedMissions || null)

    useEffect(() => {
        if(props.prefetchedMissions) {
            setMissions(props.prefetchedMissions)
        } else {
            logPrefetchFallback('TargetMissions:getMissionsForTarget', { identifier: target?.identifier || null })
            getMissionsForTarget(target).then(setMissions, console.error)
        }

        return function cleanup() {
            setMissions(null)
        }
    }, [target, props.prefetchedMissions])


    return (
        <PrimaryLayout primary={
            <>
                <Breadcrumbs currentTitle="Missions" home={target}/>
                <Typography variant="h1" gutterBottom>Mission Data</Typography>
                <Typography variant="subtitle1" >Observational data produced from a Mission or Investigation</Typography>
                <LoadingWrapper model={missions}>
                    <MissionGroupedList items={missions}/>    
                </LoadingWrapper>
                
            </>
        }/>
    )
}
