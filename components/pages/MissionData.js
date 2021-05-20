import { Link, Typography } from '@material-ui/core';
import Breadcrumbs from 'components/Breadcrumbs';
import HTMLBox from 'components/HTMLBox';
import InternalLink from 'components/InternalLink';
import PrimaryLayout from 'components/PrimaryLayout';
import React from 'react';
import { pagePaths, types } from 'services/pages.js';



export default function MissionData({mission}) {

    return (
        <PrimaryLayout primary={
            <>
                <Breadcrumbs currentTitle="Other Data" home={mission}/>

                <HTMLBox markup={mission.other_html}/>

                <Typography align="center" color="textSecondary">Additional derived data may be available on the this mission's <InternalLink identifier={mission.identifier} additionalPath={pagePaths[types.MISSIONTARGETS]} passHref><Link>target information pages</Link></InternalLink></Typography>
            </>
        } />
    )
}