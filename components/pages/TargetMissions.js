import { Typography } from '@material-ui/core';
import { getMissionsForTarget } from 'api/target';
import Breadcrumbs from 'components/Breadcrumbs';
import { MissionGroupedList } from 'components/GroupedList';
import LoadingWrapper from 'components/LoadingWrapper';
import PrimaryLayout from 'components/PrimaryLayout';
import React, { useEffect, useState } from 'react';

export default function TargetMissions(props) {
    const { target } = props
    const [missions, setMissions] = useState(null)

    useEffect(() => {
        getMissionsForTarget(target).then(setMissions, er => console.error(er))

        return function cleanup() {
            setMissions(null)
        }
    }, [target])


    return (
        <PrimaryLayout primary={
            <>
                <Breadcrumbs currentTitle="Missions" home={target}/>
                <Typography variant="h1" gutterBottom>Missions/Investigations</Typography>
                <LoadingWrapper model={missions}>
                    <MissionGroupedList items={missions}/>    
                </LoadingWrapper>
                
            </>
        }/>
    )
}