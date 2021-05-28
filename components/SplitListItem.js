import { Grid, ListItem, Typography, makeStyles } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles((theme) => ({
    metadataLabel: {
        marginBottom: 'auto'
    },
    metadataValue: {
        wordWrap: 'break-word'
    }
}))

export function LabeledListItem({label, item}) {
    const classes = useStyles()
    return <SplitListItem left={
        <Typography variant="h6" className={classes.metadataLabel} >{label}</Typography>
    } right = {item} />
}

export function SplitListItem({left, right}) {
    return <ListItem disableGutters component={Grid} container direction="row" alignItems="flex-start" spacing={1}>
    <Grid item sm={3} xs={12}>
        {left}
    </Grid>
    <Grid item sm={9} xs={12} style={{maxWidth:'100%', wordWrap: 'break-word'}}>
        {right}
    </Grid>
</ListItem>
}