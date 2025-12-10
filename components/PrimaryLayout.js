import React from 'react';
import { Container, Drawer, Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const drawerWidth = 360;

const Root = styled('div')({
    width: "100%",
    display: 'flex',
    minHeight: '60vh'
});

const OuterPrimary = styled(Box)(({ theme }) => ({
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(2),
    },
    flexGrow: 1,
}));

const InnerContainer = styled(Container)(({ theme }) => ({
    padding: theme.spacing(2)
}));

const StyledDrawer = styled(Drawer)({
    width: drawerWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
        width: drawerWidth,
        position: 'static',
    }
});

const DrawerContainer = styled(Box)({
    overflowY: 'scroll',
    maxHeight: '100%'
});

export default function PrimaryLayout({primary, secondary, navigational, ...otherProps}) {
    return (
        <Root {...otherProps}>
            { navigational && 
                <StyledDrawer variant="persistent" open={true}>
                    <DrawerContainer>
                        {navigational}
                    </DrawerContainer>
                </StyledDrawer>
            }
            <OuterPrimary>
                <InnerContainer maxWidth="lg">
                    { primary }
                    <Box my={3}/>
                    { secondary }
                </InnerContainer>
            </OuterPrimary>
        </Root>
    )
}