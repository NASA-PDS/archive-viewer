import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { getRelatedTargetsForTarget } from 'api/target';
import Breadcrumbs from 'components/Breadcrumbs';
import { RelatedTargetGroupedList } from 'components/GroupedList';
import LoadingWrapper from 'components/LoadingWrapper';
import PrimaryLayout from 'components/PrimaryLayout';
import React, { useEffect, useState } from 'react';

const useStyles = makeStyles({
    targetButton: {
        minWith: 160,
        height: '100%',
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'flex-start'
    },
    targetImage: {
        maxWidth: 250,
        flexGrow: 1
    }
});

export default function TargetRelated(props) {
    const { target } = props
    const [relatedTargets, setRelatedTargets] = useState(null)

    useEffect(() => {
        getRelatedTargetsForTarget(target).then(setRelatedTargets, er => console.error(er))
        return function cleanup() { 
            setRelatedTargets(null)
        }
    }, [props.target])

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