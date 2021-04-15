import { AppBar, Grid, Link, Tab, Tabs, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Skeleton from '@material-ui/lab/Skeleton';
import React from 'react';
import { pagePaths, types } from 'services/pages.js';
import InternalLink from './InternalLink';

const useStyles = makeStyles((theme) => ({
    description: {
        whiteSpace: 'pre-line',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2)
    },
    header: {
        backgroundColor: "#085898",
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
        fontSize: '3.5rem',
        marginLeft: theme.spacing(2)
    },
    headerImage: {
        padding: theme.spacing(1),
        [theme.breakpoints.down('sm')]: {
            height: theme.custom.headerBanner.height.sm
        },
        [theme.breakpoints.up('md')]: {
            height: theme.custom.headerBanner.height.md
        },
    },
    target: {
        backgroundColor: theme.palette.common.black
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

    return <AppBar className={classes.header} position="static" color="inherit">
        <Banner name={headerName} image_url={image_url} />
        <MissionTabBar page={page} mission={mission} {...otherProps}/>
    </AppBar>
}

function MissionTabBar({page, mission, spacecraft, instruments, targets}) {

    if(!mission) { return <SkeletonTabBar tabCount={5}/>}

    let tabValue
    switch(page) {
        case types.BUNDLE:
        case types.COLLECTION: tabValue = types.MISSIONDATA; break;
        case types.INSTRUMENT: tabValue = types.MISSIONINSTRUMENTS; break;
        default: tabValue = page
    }

    return <Tabs value={tabValue}>
                <LinkTab label="Overview" value={types.MISSION} identifier={mission.identifier}/>
                { spacecraft && spacecraft.length > 0 && <LinkTab label="Spacecraft" value={types.SPACECRAFT} identifier={spacecraft[0].identifier}/> }
                <LinkTab label="Instruments" value={types.MISSIONINSTRUMENTS} identifier={mission.identifier} additionalPath={pagePaths[types.MISSIONINSTRUMENTS]}/>
                <LinkTab label="Targets" value={types.MISSIONTARGETS} identifier={mission.identifier} additionalPath={pagePaths[types.MISSIONTARGETS]}/>
                <LinkTab label="Tools" value={types.MISSIONTOOLS} identifier={mission.identifier} additionalPath={pagePaths[types.MISSIONTOOLS]}/>
                <LinkTab label="Data" value={types.MISSIONDATA} identifier={mission.identifier} additionalPath={pagePaths[types.MISSIONDATA]}/>
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
    return props.identifier ? <InternalLink passHref {...otherProps}><Tab label={label} value={value} /></InternalLink> : <Tab {...props} />
}

function TargetHeader(props) {
    const {target, pdsOnly, page} = props
    const classes = useStyles();

    if(!target) {
        return <AppBar className={`${classes.header} ${classes.target}`} position="static" color="inherit"><SkeletonBanner/><SkeletonTabBar/></AppBar>
    }
    
    const {display_name, title, image_url} = target
    const headerName = display_name && !pdsOnly ? display_name : title

    return  <AppBar className={`${classes.header} ${classes.target}`} position="static" color="inherit">
        <Banner name={headerName} image_url={image_url} />
        <TargetTabBar page={page} target={target} />
    </AppBar>
}

function TargetTabBar({page, target}) {

    if(!target) { return <SkeletonTabBar tabCount={4}/>}

    return <Tabs value={page}>
                <LinkTab label="Overview" value={types.TARGET} identifier={target.identifier}/>
                <LinkTab label="Related" value={types.TARGETRELATED} identifier={target.identifier} additionalPath={pagePaths[types.TARGETRELATED]}/>
                <LinkTab label="Missions" value={types.TARGETMISSIONS} identifier={target.identifier} additionalPath={pagePaths[types.TARGETMISSIONS]}/>
                <LinkTab label="Tools" value={types.TARGETTOOLS} identifier={target.identifier} additionalPath={pagePaths[types.TARGETTOOLS]}/>
                <LinkTab label="Data" value={types.TARGETDATA} identifier={target.identifier} additionalPath={pagePaths[types.TARGETDATA]}/>
            </Tabs>
}

function Banner({name, image_url}) {
    const classes = useStyles();
    return <Grid container direction="row" alignItems="center" className={classes.banner}>
        { image_url && <Grid item className={classes.headerImage} component="img" alt={"Image of " + name} src={image_url} /> }
        <Grid item component={Typography} variant="h1" className={classes.bannerTitle}> { name } Data Archive </Grid>
    </Grid>
}

function SkeletonBanner() {
    const classes = useStyles();
    return <Grid container direction="row" alignItems="center" className={classes.banner}>
        <Grid item style={{margin: 10}} component={Skeleton} variant="circle" width={140} height={140} />
        <Grid item component={Typography} variant="h1"> <Skeleton variant="text" width={400}/> </Grid>
    </Grid>
}

export { MissionHeader, TargetHeader };
