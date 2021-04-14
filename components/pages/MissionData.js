import { Typography } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import { getDatasetsForMission } from 'api/mission.js';
import Breadcrumbs from 'components/Breadcrumbs';
import { Menu } from 'components/ContextHeaders';
import MissionDataTable from 'components/DatasetTable';
import LoadingWrapper from 'components/LoadingWrapper';
import PDS3Results from 'components/PDS3Results';
import PrimaryLayout from 'components/PrimaryLayout';
import React, { useEffect, useState } from 'react';
import { groupByRelatedItems } from 'services/groupings';



export default function MissionData(props) {
    const {mission, instruments, spacecraft} = props
    const [datasets, setDatasets] = useState(null)
    
    useEffect(() => {
        if(!!mission && !!instruments && !!spacecraft) getDatasetsForMission(mission, spacecraft, instruments).then(setDatasets, console.error)
        return function cleanup() { 
            setDatasets(null)
        }
    }, [mission, spacecraft, instruments])

    return (
        <>
            <Menu/>
            <PrimaryLayout primary={
                <>
                    <Breadcrumbs currentTitle="Data" home={mission}/>

                    <Typography variant="h1" gutterBottom>All datasets</Typography>
                    <LoadingWrapper model={datasets} skeleton={<>
                                <Skeleton width="100%" height={40}/>
                                <Skeleton width="100%" height={80}/>
                                <Skeleton width="100%" height={80}/>
                            </>}>
                        <MissionDataTable groups={groupByRelatedItems(datasets, 'instrument_ref')} />
                    </LoadingWrapper>
                </>
            } secondary = {
                <PDS3Results name={mission.display_name ? mission.display_name : mission.title}/>
            } />
        </>
    )
}