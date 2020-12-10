import React from 'react';
import { Box,  } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column'
    },
}));

export default function({children}) {
    const classes = useStyles()
    return <Box className={classes.container}>{children}</Box>
}