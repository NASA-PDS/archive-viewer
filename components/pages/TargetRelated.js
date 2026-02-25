import { Typography } from '@mui/material';
import Breadcrumbs from 'components/Breadcrumbs';
import { RelatedTargetGroupedList } from 'components/GroupedList';
import LoadingWrapper from 'components/LoadingWrapper';
import PrimaryLayout from 'components/PrimaryLayout';
import React, { useEffect, useState } from 'react';
import { getRelatedTargetsForTarget } from 'api/target';
import { logPrefetchFallback } from 'services/prefetchFallbackLog';

export default function TargetRelated(props) {
    const { target } = props
    const [relatedTargets, setRelatedTargets] = useState(props.prefetchedRelatedTargets || null)

    useEffect(() => {
        if(props.prefetchedRelatedTargets) {
            setRelatedTargets(props.prefetchedRelatedTargets)
        } else {
            logPrefetchFallback('TargetRelated:getRelatedTargetsForTarget', { identifier: target?.identifier || null })
            getRelatedTargetsForTarget(target).then(setRelatedTargets, console.error)
        }
        return function cleanup() { 
            setRelatedTargets(null)
        }
    }, [props.target, props.prefetchedRelatedTargets])

    return (
        <PrimaryLayout primary={
            <>
                <Breadcrumbs currentTitle="Related" home={target}/>                
                <Typography variant="h1" gutterBottom>Related Targets</Typography>
                <LoadingWrapper model={relatedTargets}>
                    {relatedTargets && 
                        <RelatedTargetGroupedList items={relatedTargets}/>
                    }
                </LoadingWrapper>
            </>
        }/>
    )
}
