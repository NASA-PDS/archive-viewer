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
    const [targets, setTargets] = useState(null)
    const [primaryBundle, setPrimaryBundle] = useState(null)

    useEffect(() => {
        getTargetsForMission(mission).then(setTargets, console.error)
        if(!pdsOnly) { 
            getPrimaryBundleForMission(mission).then((bundle) => {
                setPrimaryBundle(bundle)
            }, er => console.error(er))
        }

        return function cleanup() { 
            setTargets(null)
        }
    }, [lidvid])

    return (
        <>
            <Menu/>
            <PrimaryLayout primary={
                <>
                    <MissionDescription model={mission} />

                    { primaryBundle && <DatasetSynopsis dataset={primaryBundle} /> }

                    {!!targets ? 
                        <>
                            <Typography variant="h2" gutterBottom>Targets of observation</Typography>
                            { targets.length > 6 ? 
                                <TargetListBox items={targets} groupInfo={targetSpacecraftRelationshipTypes} hideHeader/>
                            : 
                                <Grid container direction="row" alignItems="flex-start" justify="center" spacing="2" style={{width: '100%'}}>
                                    { targets.map(target => (
                                        <Grid item key={target.identifier} ><ButtonForTarget target={target}/></Grid>
                                    ))}
                                </Grid>
                            } 
                        </>
                        : <Loading/>
                    }
                </>
            } />
        </>
    )
}

function ButtonForTarget({target}) {
    const classes = useStyles()
    return (
        <Card raised={true} className={classes.targetButton} p={1}>
            <InternalLink identifier={target.identifier} passHref>
            <CardActionArea className={classes.targetButton} underline="none">
                {target.image_url && <CardMedia component="img" className={classes.targetImage} image={target.image_url} alt={'Image of ' + target.title} title={target.title}/>}
                <CardContent p="1">
                    <Typography p="3" variant="h5" component="h2" color="primary">{target.display_name ? target.display_name : target.title}</Typography>
                </CardContent>
            </CardActionArea>
            </InternalLink>
        </Card>
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