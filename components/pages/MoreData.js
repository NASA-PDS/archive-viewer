import { Link, Typography } from '@mui/material';
import Breadcrumbs from 'components/Breadcrumbs';
import DatasetTable from 'components/DatasetTable';
import { getDatasetsForMission, getFriendlyTargetsForMission } from 'api/mission';
import HTMLBox from 'components/HTMLBox';
import InternalLink from 'components/InternalLink';
import PrimaryLayout from 'components/PrimaryLayout';
import React, { useEffect, useState } from 'react';
import { groupByField, groupByFirstTag } from 'services/groupings';
import { pagePaths, types } from 'services/pages.js';
import { DerivedDataGroupedList } from 'components/GroupedList';
import LoadingWrapper from 'components/LoadingWrapper';
import { getMoreDatasetsForContext } from 'api/common';



export default function MoreData({missions, targets, context}) {
    const [datasets, setDatasets] = useState(null)

    useEffect(() => {        
        // if we have missions, get the datasets for each mission
        if(!!missions && !!targets) {
            let datasetts = getMoreDatasetsForContext(missions, targets, context)
            datasetts.then(datasets => {
                setDatasets(datasets)
            }, console.error)
        }
        return function cleanup() {
            setDatasets(null)
        }
    }, [missions, targets])

    const hasContent = (!!datasets && datasets.length > 0) || (!!missions && !!missions[0].other_html && missions[0].other_html.length > 0)

    return (
        <PrimaryLayout primary={
            <>
                <Breadcrumbs currentTitle="More Data" home={missions?.length > 0 ? missions[0] : targets[0]}/>

                <Typography variant="h1" >More Data</Typography>
                <Typography variant="subtitle1" >Additional data related to this mission/target</Typography>

                <LoadingWrapper model={datasets} showEmpty={!hasContent} >
                    <DatasetTable groups={groupByFirstTag(datasets)} />
                </LoadingWrapper>

                {missions && missions.length > 0 &&
                    <HTMLBox markup={missions[0].other_html}/>
                }

                {/* <Typography align="center" color="textSecondary">Additional derived data may be available on the this mission's <InternalLink identifier={mission.identifier} additionalPath={pagePaths[types.MISSIONTARGETS]} passHref><Link>target information pages</Link></InternalLink></Typography> */}
            </>
        } />
    )
}