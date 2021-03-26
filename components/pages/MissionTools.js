import { Typography } from '@material-ui/core';
import Breadcrumbs from 'components/Breadcrumbs';
import { Menu } from 'components/ContextHeaders';
import PrimaryLayout from 'components/PrimaryLayout';
import RelatedTools from 'components/RelatedTools';
import React from 'react';

export default function MissionTools({mission}) {

    return (
        <>
            <Menu/>
            <PrimaryLayout primary={
                <>
                    <Breadcrumbs currentTitle="Tools" home={mission}/>
                    <Typography variant="h1" gutterBottom>Useful tools</Typography>
                    <RelatedTools tools={mission.tools} noTitle/>
                </>
            }/>
        </>
    )
}