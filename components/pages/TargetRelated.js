import { Card, CardActionArea, CardContent, CardMedia, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { getRelatedTargetsForTarget } from 'api/target';
import Breadcrumbs from 'components/Breadcrumbs';
import { Menu } from 'components/ContextHeaders';
import InternalLink from 'components/InternalLink';
import { RelatedTargetListBox } from 'components/ListBox';
import Loading from 'components/Loading';
import LoadingWrapper from 'components/LoadingWrapper';
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

export default function TargetRelated(props) {
    const { target } = props
    const [relatedTargets, setRelatedTargets] = useState(null)

    useEffect(() => {
        getRelatedTargetsForTarget(target).then(setRelatedTargets, er => console.error(er))
        return function cleanup() { 
            setRelatedTargets(null)
        }
    }, [props.target])

    return (
        <PrimaryLayout primary={
            <>
                <Breadcrumbs currentTitle="Related" home={target}/>                
                <Typography variant="h1" gutterBottom>Related Targets</Typography>
                <LoadingWrapper model={relatedTargets}>
                    {relatedTargets && (relatedTargets.length > 6 ? 
                    <RelatedTargetListBox items={relatedTargets} hideHeader/>
                    : 
                    <Grid container direction="row" alignItems="stretch" justify="center" spacing={2} style={{width: '100%'}}>
                        { relatedTargets.map(target => (
                            <Grid item key={target.identifier} ><ButtonForTarget target={target}/></Grid>
                        ))}
                    </Grid>)}
                </LoadingWrapper>
            </>
        }/>
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