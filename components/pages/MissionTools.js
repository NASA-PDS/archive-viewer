import { Typography } from '@mui/material';
import Breadcrumbs from 'components/Breadcrumbs';
import { Menu } from 'components/ContextHeaders';
import LoadingWrapper from 'components/LoadingWrapper';
import PrimaryLayout from 'components/PrimaryLayout';
import RelatedTools from 'components/RelatedTools';
import React from 'react';

export default function MissionTools({mission}) {

    return (
        <PrimaryLayout primary={
            <>
                <Breadcrumbs currentTitle="Tools" home={mission}/>
                <Typography variant="h1" gutterBottom>Useful tools</Typography>
                <LoadingWrapper model={mission.tools}>
                    <RelatedTools tools={mission.tools} noTitle/>
                </LoadingWrapper>
            </>
        }/>
    )
}