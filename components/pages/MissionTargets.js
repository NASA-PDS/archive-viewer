import { Card, CardActionArea, CardContent, CardMedia, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { getFriendlyTargetsForMission } from 'api/mission.js';
import { targetMissionRelationshipTypes } from 'api/relationships';
import { Menu } from 'components/ContextHeaders';
import InternalLink from 'components/InternalLink';
import { TargetListBox } from 'components/ListBox';
import Loading from 'components/Loading';
import PrimaryLayout from 'components/PrimaryLayout';
import React, { useEffect, useState } from 'react';
import Breadcrumbs from 'components/Breadcrumbs'
import LoadingWrapper from 'components/LoadingWrapper';

const useStyles = makeStyles({
    targetButton: {
        minWith: 160,
        height: '100%',
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'flex-start'
    },
    targetImage: {
        maxWidth: 250,
        flexGrow: 1
    }
});

export default function MissionTargets(props) {
    const { mission } = props
    const [targets, setTargets] = useState(props.targets)

    useEffect(() => {
        if(!!props.targets) getFriendlyTargetsForMission(props.targets, mission.identifier).then(setTargets, console.error)
        return function cleanup() { 
            setTargets(null)
        }
    }, [props.targets])

    return (
        <>
            <Menu/>
            <PrimaryLayout primary={
                <>
                    <Breadcrumbs currentTitle="Targets" home={mission}/>
                    <Typography variant="h1" gutterBottom>Targets of observation</Typography>
                    <LoadingWrapper model={targets}>
                        {targets && (targets.length > 6 ? 
                            <TargetListBox items={targets} groupInfo={targetMissionRelationshipTypes} hideHeader/>
                        : 
                            <Grid container direction="row" alignItems="stretch" justify="center" spacing={2} style={{width: '100%'}}>
                                { targets.map(target => (
                                    <Grid item key={target.identifier} ><ButtonForTarget target={target}/></Grid>
                                ))}
                            </Grid>)}
                    </LoadingWrapper>
                </>
            }/>
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