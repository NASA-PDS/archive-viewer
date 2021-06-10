import React from 'react';
import { Box, Grid, Typography } from '@material-ui/core'
import { LinkOff } from '@material-ui/icons';

export default function EmptyMessage() {
    
    return <Box m={3}>
            <Grid container spacing={2} alignItems="center">
            <Grid item>
                <LinkOff color="disabled"/>
            </Grid>
            <Grid item>
                <Typography variant="body1" color="textSecondary">None found</Typography>
            </Grid>
        </Grid>
    </Box>
}