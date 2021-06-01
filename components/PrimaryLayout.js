import React from 'react';
import { Container, Drawer, Box, Paper} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';

const drawerWidth = 360;

const useStyles = makeStyles((theme) => ({
    root: {
        width: "100%",
        display: 'flex',
        minHeight: '60vh'
    },
    outerPrimary: {
        [theme.breakpoints.up('sm')]: {
            padding: theme.spacing(2),
        },
        flexGrow: 1,
    },
    innerContainer: {
        padding: theme.spacing(2)
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerContainer: {
        overflowY: 'scroll',
        maxHeight: '100%'
    },
    drawerPaper: {
        width: drawerWidth,
        position: 'static',
    }
}));

export default function PrimaryLayout({primary, secondary, navigational}) {
    const classes = useStyles()
    return (
        <div className={classes.root}>
            { navigational && 
                <Drawer variant="persistent" open={true} className={classes.drawer} classes={{ paper: classes.drawerPaper }}>
                    <Box className={classes.drawerContainer}>
                        {navigational}
                    </Box>
                </Drawer>
            }
            <Box className={classes.outerPrimary}>
                <Container maxWidth="lg" className={classes.innerContainer}>
                    { primary }
                    <Box my={3}/>
                    { secondary }
                </Container>
            </Box>
        </div>
    )
}