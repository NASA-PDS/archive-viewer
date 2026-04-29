import { Link, Typography } from '@mui/material';
import Breadcrumbs from 'components/Breadcrumbs';
import DatasetTable from 'components/DatasetTable';
import HTMLBox from 'components/HTMLBox';
import PrimaryLayout from 'components/PrimaryLayout';
import React, { useEffect, useState } from 'react';
import { groupByField, groupByFirstTag } from 'services/groupings';
import LoadingWrapper from 'components/LoadingWrapper';
import { getMoreDatasetsForContext } from 'api/common';
import { logPrefetchFallback } from 'services/prefetchFallbackLog';
import { contexts } from 'services/pages';

export default function MoreData({missions, targets, context, prefetchedDatasets, prefetchedCollectionsById}) {
    const [datasets, setDatasets] = useState(prefetchedDatasets || null)

    // get the primary mission/target based on this page's context
    const primary = context == contexts.MISSION_MORE_DATA
        ? (missions && missions.length > 0 ? missions[0] : null)
        : (targets && targets.length > 0 ? targets[0] : null)

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

    const hasContent = (!!datasets && datasets.length > 0) || (!!primary?.other_html && primary.other_html.length > 0)

    return (
        <PrimaryLayout primary={
            <>
                <Breadcrumbs currentTitle="More Data" home={primary}/>

                <Typography variant="h1" >More Data</Typography>
                <Typography variant="subtitle1" >Additional data related to this mission/target</Typography>

                <LoadingWrapper model={datasets} showEmpty={!hasContent} >
                    <DatasetTable groups={groupByFirstTag(datasets)} prefetchedCollectionsById={prefetchedCollectionsById} />
                </LoadingWrapper>

                {!!primary &&
                    <HTMLBox markup={primary.other_html}/>
                }

                {/* <Typography align="center" color="textSecondary">Additional derived data may be available on the this mission's <InternalLink identifier={mission.identifier} additionalPath={pagePaths[types.MISSIONTARGETS]} passHref><Link>target information pages</Link></InternalLink></Typography> */}
            </>
        } />
    )
}
