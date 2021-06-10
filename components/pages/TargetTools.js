import { Typography } from '@material-ui/core';
import Breadcrumbs from 'components/Breadcrumbs';
import { Menu } from 'components/ContextHeaders';
import LoadingWrapper from 'components/LoadingWrapper';
import PrimaryLayout from 'components/PrimaryLayout';
import RelatedTools from 'components/RelatedTools';
import React from 'react';

export default function TargetTools({target}) {

    return (
        <PrimaryLayout primary={
            <>
                <Breadcrumbs currentTitle="Tools" home={target}/>
                <Typography variant="h1" gutterBottom>Useful tools</Typography>
                <LoadingWrapper model={target.tools}>
                    <RelatedTools tools={target.tools} noTitle/>
                </LoadingWrapper>
            </>
        }/>
    )
}