import { Typography } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import { getDatasetsForTarget } from 'api/target';
import Breadcrumbs from 'components/Breadcrumbs';
import { Menu } from 'components/ContextHeaders';
import DatasetTable from 'components/DatasetTable';
import PDS3Results from 'components/PDS3Results';
import PrimaryLayout from 'components/PrimaryLayout';
import React, { useEffect, useState } from 'react';
import { groupByRelatedItems } from 'services/groupings';

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
        <>
            <Menu/>
            <PrimaryLayout primary={
                <>
                    <Breadcrumbs currentTitle="Data" home={target}/>

                    <Typography variant="h1" gutterBottom>Non-Mission {target.display_name || target.title} Data</Typography>
                    { datasets ? 
                        <DatasetTable groups={groupByRelatedItems(datasets, 'instrument_ref')} />
                        : <>
                            <Skeleton width="100%" height={40}/>
                            <Skeleton width="100%" height={80}/>
                            <Skeleton width="100%" height={80}/>
                        </>
                    }                  
                </>
            } secondary={
                <PDS3Results name={target.display_name ? target.display_name : target.title}/>
            }/>
        </>
    )
}