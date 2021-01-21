import React, { useEffect, useState } from 'react';
import {getSpacecraftForMission} from 'api/mission.js'
import {MissionHeader, MissionDescription, Menu} from 'components/ContextObjects'
import Loading from 'components/Loading'
import Spacecraft from 'components/pages/Spacecraft'
import PrimaryLayout from 'components/PrimaryLayout';
import InternalLink from 'components/InternalLink'
import { Typography, Grid, Card, CardActionArea, CardContent, CardMedia } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    spacecraftButton: {
        minWith: 160,
        height: '100%'
    },
    spacecraftImage: {
        maxWidth: 250
    }
});

export default function Mission({mission, lidvid}) {
    const [spacecraft, setSpacecraft] = useState(null)

    useEffect(() => {
        getSpacecraftForMission(mission).then(setSpacecraft, er => console.error(er))

        return function cleanup() { setSpacecraft(null) }
    }, [lidvid])

    // if this mission only has one spacecraft, we should just show that spacecraft's page
    if(spacecraft && spacecraft.length === 1) return <Spacecraft spacecraft={spacecraft[0]}></Spacecraft>

    return (
        <>
            <MissionHeader model={mission} />
            <Menu/>
            <PrimaryLayout primary={
                <>
                    <MissionDescription model={mission} />
                    {!!spacecraft ? 
                        <Grid container direction="column" alignItems="flex-start" spacing="2">
                            <Grid item component={Typography} variant="h2">View the mission's data for:</Grid>
                            { spacecraft.map(spacecraft => (
                                <Grid item key={spacecraft.identifier} ><ButtonForSpacecraft spacecraft={spacecraft}/></Grid>
                            ))}
                        </Grid>
                        : <Loading/>
                    }
                </>
            }/>
        </>
    )
}

function ButtonForSpacecraft({spacecraft}) {
    const classes = useStyles()
    return (
        <Card raised={true} className={classes.spacecraftButton} p={1}>
            <InternalLink identifier={spacecraft.identifier} passHref>
            <CardActionArea className={classes.spacecraftButton} underline="none">
                {spacecraft.image_url && <CardMedia component="img" className={classes.spacecraftImage} image={spacecraft.image_url} alt={'Image of ' + spacecraft.title} title={spacecraft.title}/>}
                <CardContent p="1">
                    <Typography p="3" variant="h5" component="h2" color="primary">{spacecraft.display_name ? spacecraft.display_name : spacecraft.title}</Typography>
                </CardContent>
            </CardActionArea>
            </InternalLink>
        </Card>
    )
}