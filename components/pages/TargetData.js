import { Typography, Skeleton } from '@mui/material';
import Breadcrumbs from 'components/Breadcrumbs';
import { Menu } from 'components/ContextHeaders';
import DatasetTable from 'components/DatasetTable';
import HTMLBox from 'components/HTMLBox';
import LoadingWrapper from 'components/LoadingWrapper';
import PDS3Results from 'components/PDS3Results';
import PrimaryLayout from 'components/PrimaryLayout';
import React, { useEffect, useState } from 'react';
import { groupByNothing } from 'services/groupings';
import { getDerivedDatasetsForTarget } from 'api/target';
import { logPrefetchFallback } from 'services/prefetchFallbackLog';

export default function TargetData(props) {
    const { target } = props
    
    const [datasets, setDatasets] = useState(props.prefetchedDatasets || null)

    useEffect(() => {
        if(props.prefetchedDatasets) {
            setDatasets(props.prefetchedDatasets)
        } else {
            logPrefetchFallback('TargetData:getDerivedDatasetsForTarget', { identifier: target?.identifier || null })
            getDerivedDatasetsForTarget(target).then(setDatasets, console.error)
        }

        return function cleanup() {
            setDatasets(null)
        }
    }, [target, props.prefetchedDatasets])


    return (
        <PrimaryLayout primary={
            <>
                <Breadcrumbs currentTitle="Derived Data" home={target}/>

                <Typography variant="h1" gutterBottom>Derived {target.display_name || target.title} Data</Typography>
                <Typography variant="subtitle1" >Higher-order data products related to a target of observation</Typography>
                <LoadingWrapper model={datasets} showEmpty={!target.derived_html || target.derived_html.length === 0}
                        skeleton={<>
                            <Skeleton width="100%" height={40}/>
                            <Skeleton width="100%" height={80}/>
                            <Skeleton width="100%" height={80}/>
                        </>}>
                    <DatasetTable groups={groupByNothing(datasets)} prefetchedCollectionsById={props.prefetchedCollectionsById} />
                </LoadingWrapper>  
                <HTMLBox markup={target.derived_html}/>        
            </>
        } secondary={
            <PDS3Results name={target.display_name ? target.display_name : target.title}/>
        }/>
    )
}
