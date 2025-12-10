import React from 'react';
import { Card, CardHeader, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    margin: theme.spacing(1),
    padding: theme.spacing(1),
    [theme.breakpoints.up('sm')]: {
        margin: theme.spacing(2),
        padding: theme.spacing(2)
    },
}));

export default function TangentCard({title, children}) {
    return <StyledCard raised={true}>
        { title && <CardHeader title={title}/> }
        { title && <Divider/> }
        {children}
    </StyledCard>
}