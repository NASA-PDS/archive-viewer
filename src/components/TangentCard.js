import React from 'react';
import { Card, CardHeader, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    container: {
        backgroundColor: theme.palette.secondary.light,
        margin: theme.spacing(2)
    },
}));

export default function({title, children}) {
    const classes = useStyles()
    return <Card raised={true} p={2} className={classes.container}>
        <CardHeader title={title}/>
        <Divider/>
        {children}
    </Card>
}