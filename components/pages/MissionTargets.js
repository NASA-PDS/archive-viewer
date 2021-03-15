import { Card, CardActionArea, CardContent, CardMedia, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { getTargetsForMission } from 'api/mission.js';
import { targetSpacecraftRelationshipTypes } from 'api/relationships';
import { getTargetsForSpacecraft } from 'api/spacecraft';
import { Menu } from 'components/ContextObjects';
import InternalLink from 'components/InternalLink';
import { TargetListBox } from 'components/ListBox';
import Loading from 'components/Loading';
import PrimaryLayout from 'components/PrimaryLayout';
import React, { useEffect, useState } from 'react';

const useStyles = makeStyles({
    targetButton: {
        minWith: 160,
        height: '100%'
    },
    targetImage: {
        maxWidth: 250
    }
});

export default function Mission(props) {
    const [targets, setTargets] = useState(null)

    useEffect(() => {
        getTargetsForSpacecraft(props.targets, props.spacecraft).then(setTargets, console.error)
        return function cleanup() { 
            setTargets(null)
        }
    }, [props.targets, props.spacecraft])

    return (
        <>
            <Menu/>
            <PrimaryLayout primary={!!targets ? 
                <>
                    <Typography variant="h2" gutterBottom>Targets of observation</Typography>
                    { targets.length > 6 ? 
                        <TargetListBox items={targets} groupInfo={targetSpacecraftRelationshipTypes} hideHeader/>
                    : 
                        <Grid container direction="row" alignItems="flex-start" justify="center" spacing={2} style={{width: '100%'}}>
                            { targets.map(target => (
                                <Grid item key={target.identifier} ><ButtonForTarget target={target}/></Grid>
                            ))}
                        </Grid>
                    } 
                </>
                : <Loading/>
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