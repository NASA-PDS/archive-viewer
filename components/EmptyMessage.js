import React from 'react';
import { Box, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2';
import LinkOff from '@mui/icons-material/LinkOff';

export default function EmptyMessage() {
    
    return <Box m={3}>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid>
                <LinkOff color="disabled"/>
            </Grid>
            <Grid>
                <Typography variant="body1" color="textSecondary">None found</Typography>
            </Grid>
        </Grid>
    </Box>
}