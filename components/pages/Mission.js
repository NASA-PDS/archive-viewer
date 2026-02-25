import { Button, Typography } from '@mui/material';
import HTMLBox from 'components/HTMLBox';
import InternalLink from 'components/InternalLink';
import { Metadata } from "components/Metadata";
import PrimaryLayout from 'components/PrimaryLayout';
import { LabeledListItem } from 'components/SplitListItem';
import { TagTypes } from 'components/TagSearch.js';
import React, { useEffect, useState } from 'react';
import { getPrimaryBundleForMission } from 'api/mission';
import { logPrefetchFallback } from 'services/prefetchFallbackLog';


export default function Mission({mission, lidvid, pdsOnly, prefetchedPrimaryBundle}) {
    const [primaryBundle, setPrimaryBundle] = useState(prefetchedPrimaryBundle || null)

    useEffect(() => {
        if(prefetchedPrimaryBundle) {
            setPrimaryBundle(prefetchedPrimaryBundle)
            return
        }

        if(!pdsOnly) {
            logPrefetchFallback('Mission:getPrimaryBundleForMission', { identifier: mission?.identifier || null })
            getPrimaryBundleForMission(mission).then(setPrimaryBundle, console.error)
        }

        return function cleanup() { 
            setPrimaryBundle(null)
        }
    }, [lidvid, prefetchedPrimaryBundle, pdsOnly, mission])

    return (
        <PrimaryLayout primary={
            <>
                <Typography variant="h1" gutterBottom> { mission.display_name ? mission.display_name : mission.title } </Typography>
                <HTMLBox markup={mission.html1} />
                <Metadata model={mission} tagType={TagTypes.mission}/>
                { primaryBundle && 
                    <LabeledListItem label="Bundle" item={
                        <BundleLink identifier={primaryBundle.identifier} label="View Mission Information Bundle"/>
                    }/>
                }
                <HTMLBox markup={mission.html2} />   

            </>
        } />
    )
}

function BundleLink({identifier, label}) {
    return <InternalLink identifier={identifier} passHref>
            <Button color="primary" variant={"contained"} size={"large"}>{label}</Button>
    </InternalLink>
}
