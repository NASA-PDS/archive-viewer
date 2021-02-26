import React, { useEffect, useState } from 'react';
import {getTargetsForMission, getPrimaryBundleForMission} from 'api/mission.js'
import {targetSpacecraftRelationshipTypes} from 'api/relationships'
import {MissionDescription, Menu} from 'components/ContextObjects'
import Loading from 'components/Loading'
import PrimaryLayout from 'components/PrimaryLayout';
import InternalLink from 'components/InternalLink'
import { Typography, Grid, Card, CardActionArea, CardContent, CardMedia, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { TargetListBox } from 'components/ListBox';
import { Metadata, MoreInformation, DeliveryInfo } from 'components/pages/Dataset.js'
import CollectionList from 'components/CollectionList.js'

const useStyles = makeStyles({
    targetButton: {
        minWith: 160,
        height: '100%'
    },
    targetImage: {
        maxWidth: 250
    }
});

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
                    <MissionDescription model={mission} />

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