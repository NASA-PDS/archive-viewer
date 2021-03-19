import { Card, CardActionArea, CardContent, CardMedia, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { getDatasetsForMission } from 'api/mission.js';
import { targetSpacecraftRelationshipTypes } from 'api/relationships';
import { getTargetsForSpacecraft } from 'api/spacecraft';
import { Menu } from 'components/ContextObjects';
import InternalLink from 'components/InternalLink';
import { DatasetListBox, groupType } from 'components/ListBox';
import Loading from 'components/Loading';
import PrimaryLayout from 'components/PrimaryLayout';
import React, { useEffect, useState } from 'react';

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

export default function MissionData({mission, spacecraft, instruments}) {
    const [datasets, setDatasets] = useState(null)
    console.log(spacecraft)
    console.log(instruments)

    useEffect(() => {
        if(!!mission && !!instruments && !!spacecraft) getDatasetsForMission(mission, spacecraft, instruments).then(setDatasets, console.error)
        return function cleanup() { 
            setDatasets(null)
        }
    }, [mission, spacecraft, instruments])

    return (
        <>
            <Menu/>
            <PrimaryLayout primary={!!datasets ? 
                <>
                    <Typography variant="h1" gutterBottom>All datasets</Typography>
                    <DatasetListBox items={datasets} groupBy={groupType.instrument} groupInfo={instruments} />
                </>
                : <Loading/>
            }/>
        </>
    )
}
