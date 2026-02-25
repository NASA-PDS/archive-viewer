import { Link, Typography } from '@mui/material';
import Breadcrumbs from 'components/Breadcrumbs';
import DatasetTable from 'components/DatasetTable';
import HTMLBox from 'components/HTMLBox';
import InternalLink from 'components/InternalLink';
import PrimaryLayout from 'components/PrimaryLayout';
import React, { useEffect, useState } from 'react';
import { groupByField, groupByFirstTag } from 'services/groupings';
import { pagePaths, types } from 'services/pages.js';
import { DerivedDataGroupedList } from 'components/GroupedList';
import LoadingWrapper from 'components/LoadingWrapper';
import { getMoreDatasetsForContext } from 'api/common';
import { logPrefetchFallback } from 'services/prefetchFallbackLog';



export default function MoreData({missions, targets, context, prefetchedDatasets, prefetchedCollectionsById}) {
    const [datasets, setDatasets] = useState(prefetchedDatasets || null)
    const primaryMission = missions && missions.length > 0 ? missions[0] : null

    useEffect(() => {        
        if(prefetchedDatasets) {
            setDatasets(prefetchedDatasets)
        } else {
            logPrefetchFallback('MoreData:getMoreDatasetsForContext', {
                context,
                missionCount: missions?.length || 0,
                targetCount: targets?.length || 0
            })
            getMoreDatasetsForContext(missions || [], targets || [], context).then(setDatasets, console.error)
        }
        return function cleanup() {
            setDatasets(null)
        }
    }, [missions, targets, prefetchedDatasets, context])

    const hasContent = (!!datasets && datasets.length > 0) || (!!primaryMission?.other_html && primaryMission.other_html.length > 0)

    return (
        <PrimaryLayout primary={
            <>
                <Breadcrumbs currentTitle="More Data" home={primaryMission || (targets && targets.length > 0 ? targets[0] : null)}/>

                <Typography variant="h1" >More Data</Typography>
                <Typography variant="subtitle1" >Additional data related to this mission/target</Typography>

                <LoadingWrapper model={datasets} showEmpty={!hasContent} >
                    <DatasetTable groups={groupByFirstTag(datasets)} prefetchedCollectionsById={prefetchedCollectionsById} />
                </LoadingWrapper>

                {!!primaryMission &&
                    <HTMLBox markup={primaryMission.other_html}/>
                }

                {/* <Typography align="center" color="textSecondary">Additional derived data may be available on the this mission's <InternalLink identifier={mission.identifier} additionalPath={pagePaths[types.MISSIONTARGETS]} passHref><Link>target information pages</Link></InternalLink></Typography> */}
            </>
        } />
    )
}
