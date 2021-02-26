import { Box, Typography } from '@material-ui/core';
import { getPrimaryBundleForMission } from 'api/mission.js';
import CollectionList from 'components/CollectionList.js';
import { Menu, MissionDescription } from 'components/ContextObjects';
import { DeliveryInfo, MoreInformation } from 'components/pages/Dataset.js';
import { Metadata } from "components/Metadata";
import PrimaryLayout from 'components/PrimaryLayout';
import React, { useEffect, useState } from 'react';


export default function Mission({mission, lidvid, pdsOnly}) {
    const [primaryBundle, setPrimaryBundle] = useState(null)

    useEffect(() => {
        if(!pdsOnly) { 
            getPrimaryBundleForMission(mission).then((bundle) => {
                setPrimaryBundle(bundle)
            }, er => console.error(er))
        }

        return function cleanup() { 
            setPrimaryBundle(null)
        }
    }, [lidvid])

    return (
        <>
            <Menu/>
            <PrimaryLayout primary={
                <>
                    <Metadata model={mission} />

                    { primaryBundle && <DatasetSynopsis dataset={primaryBundle} /> }

                </>
            } />
        </>
    )
}


function DatasetSynopsis({dataset}) {
    return <Box my={2}>
        <Typography variant="h2" gutterBottom>{dataset.display_name || dataset.title}</Typography>
        <DeliveryInfo dataset={dataset} />
        <Metadata dataset={dataset} />
        <MoreInformation dataset={dataset} />
        <CollectionList dataset={dataset} />
    </Box>
}