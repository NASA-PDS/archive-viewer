import React from 'react';
import { Container, Drawer, Box, Paper} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';

const drawerWidth = 360;

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
        // width: "100%",
        // height: "100%",
        display: 'flex'
    },
    outerPrimary: {
        padding: theme.spacing(2),
        flexGrow: 1,
        [theme.breakpoints.down('sm')]: {
            paddingTop: theme.custom.header.height.sm
        },
        [theme.breakpoints.up('md')]: {
            paddingTop: theme.custom.header.height.md
        },
    },
    innerPrimary: {
        backgroundColor: theme.palette.grey[800],
        padding: theme.spacing(2)
    },
    innerContainer: {
        padding: 0
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
        [theme.breakpoints.down('sm')]: {
            paddingTop: theme.custom.header.height.sm
        },
        [theme.breakpoints.up('md')]: {
            paddingTop: theme.custom.header.height.md
        },
    }
}));

export default function PrimaryLayout({primary, secondary, navigational, header}) {
    const classes = useStyles()
    return (
        <div className={classes.root}>
            {header}
            { navigational && 
                <Drawer variant="permanent" className={classes.drawer} classes={{ paper: classes.drawerPaper }}>
                    <Box className={classes.drawerContainer}>
                        {navigational}
                    </Box>
                </Drawer>
            }
            <Box className={classes.outerPrimary}>
                <Container maxWidth="lg" className={classes.innerContainer}>
                    <Paper square elevation={2} className={classes.innerPrimary}  >
                        {primary}
                    </Paper>
                    { secondary }
                </Container>
            </Box>
        </div>
    )
}