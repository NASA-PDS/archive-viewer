import { Link, Typography } from '@material-ui/core';
import Breadcrumbs from 'components/Breadcrumbs';
import DatasetTable from 'components/DatasetTable';
import { getDatasetsForMission } from 'api/mission';
import HTMLBox from 'components/HTMLBox';
import InternalLink from 'components/InternalLink';
import PrimaryLayout from 'components/PrimaryLayout';
import React, { useEffect, useState } from 'react';
import { groupByField } from 'services/groupings';
import { pagePaths, types } from 'services/pages.js';



export default function MissionData({mission, spacecraft}) {
    const [datasets, setDatasets] = useState(null)

    useEffect(() => {
        if(!!mission && !!spacecraft) getDatasetsForMission(mission, spacecraft).then(setDatasets, console.error)

        return function cleanup() {
            setDatasets(null)
        }
    }, [mission, spacecraft])

    return (
        <PrimaryLayout primary={
            <>
                <Breadcrumbs currentTitle="Other Data" home={mission}/>

                <DatasetTable groups={groupByField(datasets, 'primary_result_purpose')} />

                <HTMLBox markup={mission.other_html}/>

                <Typography align="center" color="textSecondary">Additional derived data may be available on the this mission's <InternalLink identifier={mission.identifier} additionalPath={pagePaths[types.MISSIONTARGETS]} passHref><Link>target information pages</Link></InternalLink></Typography>
            </>
        } />
    )
}