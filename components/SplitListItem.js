import { Grid, ListItem, Typography, makeStyles } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles((theme) => ({
    metadataLabel: {
        marginBottom: 'auto'
    },
    metadataValue: {
        maxWidth: `calc(100vw - ${theme.spacing(3)}px)`,
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
    const classes = useStyles()
    return <ListItem disableGutters component={Grid} container direction="row" alignItems="flex-start" spacing={1}>
    <Grid item sm={3} xs={12}>
        {left}
    </Grid>
    <Grid item sm={9} xs={12} className={classes.metadataValue}>
        {right}
    </Grid>
</ListItem>
}