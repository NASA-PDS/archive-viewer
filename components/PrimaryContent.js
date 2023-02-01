import React from 'react';
import { Box,  } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column'
    },
}));

export default function PrimaryContent({children}) {
    const classes = useStyles()
    return <Box className={classes.container}>{children}</Box>
}