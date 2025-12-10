import React from 'react';
import { Box } from '@mui/material';

export default function PrimaryContent({children}) {
    return <Box sx={{ display: 'flex', flexGrow: 1, flexDirection: 'column' }}>{children}</Box>
}