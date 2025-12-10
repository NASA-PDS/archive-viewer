import { Container } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { styled } from '@mui/material/styles';
import React from 'react';

const Root = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
    width: "100%",
    height: "100%"
}));

const OuterPrimary = styled(Grid)(({ theme }) => ({
    [theme.breakpoints.up('xs')]: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2)
    },
    [theme.breakpoints.up('md')]: {
        padding: theme.spacing(2)
    }
}));

const InnerPrimary = styled(Grid)(({ theme }) => ({
    [theme.breakpoints.up('md')]: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2)
    }
}));

export default function ResponsiveLayout({primary, secondary, ...otherProps}) {
    return (
        <Root>
        <Container maxWidth="lg" >
            <OuterPrimary container direction="row" {...otherProps}>
                <InnerPrimary size="grow">
                    {primary}
                </InnerPrimary>
                <InnerPrimary size={{ xs: 12, md: 3 }}>
                    {secondary}
                </InnerPrimary>
            </OuterPrimary>
        </Container>
        </Root>
    )
}