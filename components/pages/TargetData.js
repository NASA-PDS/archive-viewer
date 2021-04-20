import { Typography } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import { getDatasetsForTarget } from 'api/target';
import Breadcrumbs from 'components/Breadcrumbs';
import { Menu } from 'components/ContextHeaders';
import DatasetTable from 'components/DatasetTable';
import LoadingWrapper from 'components/LoadingWrapper';
import PDS3Results from 'components/PDS3Results';
import PrimaryLayout from 'components/PrimaryLayout';
import React, { useEffect, useState } from 'react';
import { groupByField, groupByRelatedItems } from 'services/groupings';

export default function TargetData(props) {
    const { target } = props
    
    const [datasets, setDatasets] = useState(null)

    useEffect(() => {
        getDatasetsForTarget(target).then(setDatasets, console.error)

        return function cleanup() {
            setDatasets(null)
        }
    }, [target])


    return (
        <PrimaryLayout primary={
            <>
                <Breadcrumbs currentTitle="Data" home={target}/>

                <Typography variant="h1" gutterBottom>Derived {target.display_name || target.title} Data</Typography>
                <LoadingWrapper model={datasets} 
                        skeleton={<>
                            <Skeleton width="100%" height={40}/>
                            <Skeleton width="100%" height={80}/>
                            <Skeleton width="100%" height={80}/>
                        </>}>
                    <DatasetTable groups={groupByField(datasets, 'primary_result_purpose')} />
                </LoadingWrapper>          
            </>
        } secondary={
            <PDS3Results name={target.display_name ? target.display_name : target.title}/>
        }/>
    )
}