import React from 'react';
import { Box, Typography } from '@mui/material'

export default function Error({error}) {
    return <Typography component={Box} color="error">{error.message ? error.message : error}</Typography>
}