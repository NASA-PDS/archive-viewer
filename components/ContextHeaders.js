import { AppBar, Divider, Grid, Tab, Tabs, Typography, useTheme } from '@material-ui/core';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { Error } from '@material-ui/icons';
import Skeleton from '@material-ui/lab/Skeleton';
import DarkTheme from 'DarkTheme';
import React from 'react';
import LogicalIdentifier from 'services/LogicalIdentifier';
import { pagePaths, types } from 'services/pages.js';
import InternalLink from './InternalLink';

const useStyles = makeStyles((theme) => ({
    description: {
        whiteSpace: 'pre-line',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2)
    },
    header: {
        backgroundColor: theme.custom.missionThemeColor,
        zIndex: theme.zIndex.drawer + 1,
        display: 'flex',
        flexFlow: 'column nowrap',
    },
    banner: {
        [theme.breakpoints.down('sm')]: {
            height: theme.custom.headerBanner.height.sm
        },
        [theme.breakpoints.up('md')]: {
            height: theme.custom.headerBanner.height.md
        },
    },
    bannerTitle: {
        [theme.breakpoints.up('md')]: {
            fontSize: '3.5rem',
        },
        marginLeft: theme.spacing(2),
    },
    headerImage: {
        padding: theme.spacing(1),
        [theme.breakpoints.down('sm')]: {
            height: theme.custom.headerBanner.height.sm,
            fontSize: theme.custom.headerBanner.height.sm
        },
        [theme.breakpoints.up('md')]: {
            height: theme.custom.headerBanner.height.md,
            fontSize: theme.custom.headerBanner.height.md
        },
    },
    target: {
        backgroundColor: theme.custom.targetThemeColor
    },
    error: {
        backgroundColor: theme.palette.error.main
    },
    divider: {
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2)
    }
}));

function MissionHeader(props) {
    const {page, mission, pdsOnly, ...otherProps} = props
    const classes = useStyles();
    
    if(!mission) {
        return <AppBar className={classes.header} position="static" color="inherit"><SkeletonBanner/><SkeletonTabBar tabCount={5}/></AppBar>
    }

    const {display_name, title, image_url} = mission
    const headerName = (display_name && !pdsOnly ? display_name : title)

    // headers are always in dark mode
    return <ThemeProvider theme={DarkTheme}>  
        <AppBar className={classes.header} position="static" color="inherit">
            <Banner name={headerName + ' Data Archive'} image_url={image_url} />
            <MissionTabBar page={page} mission={mission} {...otherProps}/>
        </AppBar>
    </ThemeProvider>
}

function MissionTabBar({lidvid, page, mission, spacecraft}) {

    if(!mission) { return <SkeletonTabBar tabCount={7}/>}

    let LID = new LogicalIdentifier(lidvid)

    let tabValue
    switch(page) {
        case types.BUNDLE:
        case types.COLLECTION: {
            // for datasets, figure out if it's mission data or instrument data
            if(LID.isBundle && LID.lid === mission.mission_bundle
                || LID.isCollection && LID.parentBundle === mission.mission_bundle) {
                tabValue = types.MISSIONBUNDLE
            } else {
                tabValue = types.MISSIONINSTRUMENTS
            }
            break
        }
        case types.INSTRUMENT: tabValue = types.MISSIONINSTRUMENTS; break;
        default: tabValue = page
    }

    return <Tabs value={tabValue} indicatorColor="secondary" textColor="secondary" variant="scrollable">
                <LinkTab label="Overview" value={types.MISSION} identifier={mission.identifier}/>
                <LinkTab label="Spacecraft" value={types.SPACECRAFT} identifier={spacecraft && spacecraft.length > 0 && spacecraft[0].identifier}/>
                <LinkTab label="Targets" value={types.MISSIONTARGETS} identifier={mission.identifier} additionalPath={pagePaths[types.MISSIONTARGETS]}/>
                <LinkTab label="Tools" value={types.MISSIONTOOLS} identifier={mission.identifier} additionalPath={pagePaths[types.MISSIONTOOLS]}/>
                <Divider orientation="vertical" flexItem className={useStyles().divider} />
                <LinkTab label="Instrument Data" value={types.MISSIONINSTRUMENTS} identifier={mission.identifier} additionalPath={pagePaths[types.MISSIONINSTRUMENTS]}/>
                { mission.other_html ? 
                    <LinkTab label="Other Data" value={types.MISSIONOTHER} identifier={mission.identifier} additionalPath={pagePaths[types.MISSIONOTHER]}/> 
                    : <Tab label="Other Data" disabled/>
                }
                { mission.mission_bundle ? 
                    <LinkTab label="Mission Bundle" value={types.MISSIONBUNDLE} identifier={mission.mission_bundle}/>
                    : <Tab label="Mission Bundle" disabled/>
                }
            </Tabs>
}

function SkeletonTabBar({tabCount}) {
    return <Grid container direction="row" alignItems="center">
        {
            Array(tabCount).fill().map((_, i) => <Grid item key={i} style={{marginLeft: 10, marginRight: 10}} component={Skeleton} width={140} height={48} />)
        }
    </Grid>
}

function LinkTab(props) {
    const {label, value, ...otherProps} = props
    return <Tab label={label} value={value} component={InternalLink} includeTag {...otherProps}/>
}

function TargetHeader(props) {
    const {target, pdsOnly, page} = props
    const classes = useStyles();

    if(!target) {
        return <AppBar className={`${classes.header} ${classes.target}`} position="static" color="inherit"><SkeletonBanner/><SkeletonTabBar/></AppBar>
    }
    
    const {display_name, title, image_url} = target
    const headerName = display_name && !pdsOnly ? display_name : title

    // headers are always in dark mode
    return <ThemeProvider theme={DarkTheme}>
        <AppBar className={`${classes.header} ${classes.target}`} position="static" color="inherit">
            <Banner name={headerName + ' Information Page'} image_url={image_url} />
            <TargetTabBar page={page} target={target} />
        </AppBar>
    </ThemeProvider>
}

function TargetTabBar({page, target}) {

    if(!target) { return <SkeletonTabBar tabCount={4}/>}

    return <Tabs value={page} textColor="secondary" variant="scrollable">
                <LinkTab label="Overview" value={types.TARGET} identifier={target.identifier}/>
                <LinkTab label="Related" value={types.TARGETRELATED} identifier={target.identifier} additionalPath={pagePaths[types.TARGETRELATED]}/>
                <LinkTab label="Tools" value={types.TARGETTOOLS} identifier={target.identifier} additionalPath={pagePaths[types.TARGETTOOLS]}/>
                <Divider orientation="vertical" flexItem className={useStyles().divider} />
                <LinkTab label="Mission Data" value={types.TARGETMISSIONS} identifier={target.identifier} additionalPath={pagePaths[types.TARGETMISSIONS]}/>
                <LinkTab label="Derived Data" value={types.TARGETDATA} identifier={target.identifier} additionalPath={pagePaths[types.TARGETDATA]}/>
            </Tabs>
}

function ErrorHeader() {
    const classes = useStyles();
    
    return (
        <ThemeProvider theme={DarkTheme}>
            <AppBar className={`${classes.header} ${classes.error}`} position="static" color="inherit">
                <Banner name={"Error"} icon={Error}/>
            </AppBar>
        </ThemeProvider>
    )
}

function Banner({name, image_url, icon}) {
    const classes = useStyles()
    const theme = useTheme()
    return <Grid container direction="row" alignItems="center" className={classes.banner} wrap="nowrap">
        { image_url && <Grid item className={classes.headerImage} component="img" alt={"Image of " + name} src={image_url} /> }
        { icon && React.createElement(icon, { className: classes.headerImage, htmlColor: theme.palette.text.primary}) }
        <Grid item component={Typography} variant="h1" className={classes.bannerTitle}> { name } </Grid>
    </Grid>
}

function SkeletonBanner() {
    const classes = useStyles();
    return <Grid container direction="row" alignItems="center" className={classes.banner}>
        <Grid item style={{margin: 10}} component={Skeleton} variant="circle" width={140} height={140} />
        <Grid item component={Typography} variant="h1"> <Skeleton variant="text" width={400}/> </Grid>
    </Grid>
}

export { MissionHeader, TargetHeader, ErrorHeader };
