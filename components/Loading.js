import React from 'react';
import { CircularProgress, Backdrop } from '@mui/material'

export default function Loading({fullscreen}) {
    if(fullscreen) {
        return <Backdrop open={true}>{loadingCircle}</Backdrop>
    }   
    else return loadingCircle
}

const loadingCircle = <CircularProgress />