import React, { useState, useEffect } from 'react';
import { Grid, Typography, Link, AppBar, Tabs, Tab } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import Skeleton from '@material-ui/lab/Skeleton';
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
    headerImage: {
        padding: '8px',
        [theme.breakpoints.down('sm')]: {
            height: theme.custom.headerBanner.height.sm
        },
        [theme.breakpoints.up('md')]: {
            height: theme.custom.headerBanner.height.md
        },
    },
    menu: {
        position: 'absolute',
        top: 5,
        right: 5,
        height: 30,
        zIndex: 99
    },
    target: {
        backgroundColor: theme.palette.common.black
    }
}));

function MissionHeader(props) {
    const {type, mission, pdsOnly, instruments, spacecraft} = props
    const classes = useStyles();
    
    if(!mission) {
        return <AppBar className={classes.header} position="static" color="inherit"><SkeletonBanner/><SkeletonTabBar/></AppBar>
    }

    const {display_name, title, image_url} = mission
    const headerName = (display_name && !pdsOnly ? display_name : title)

    return <AppBar className={classes.header} position="static" color="inherit">
        <Banner name={headerName} image_url={image_url} />
        <TabBar type={type} mission={mission} instruments={instruments} spacecraft={spacecraft}/>
    </AppBar>
}

function TabBar({type, mission, instruments, spacecraft}) {

    if(!mission) { return <Tabs />}

    return <Tabs value={type}>
                <LinkTab label="Overview" value="mission" identifier={mission.identifier}/>
                <LinkTab label="Spacecraft" value="spacecraft" identifier={spacecraft && spacecraft.length > 0 ? spacecraft[0].identifier : null}/>
                <LinkTab label="Instruments" value="instrument" identifier={mission.identifier} additionalPath={'instruments'}/>
                <LinkTab label="Targets" value="target" identifier={mission.identifier} additionalPath={'targets'}/>
                <LinkTab label="Data" value="data" identifier={mission.identifier} additionalPath={'data'}/>
            </Tabs>
}

function SkeletonTabBar() {
    return <Grid container direction="row" alignItems="center">
        <Grid item style={{marginLeft: 10, marginRight: 10}} component={Skeleton} width={140} height={48} />
        <Grid item style={{marginLeft: 10, marginRight: 10}} component={Skeleton} width={140} height={48} />
        <Grid item style={{marginLeft: 10, marginRight: 10}} component={Skeleton} width={140} height={48} />
        <Grid item style={{marginLeft: 10, marginRight: 10}} component={Skeleton} width={140} height={48} />
        <Grid item style={{marginLeft: 10, marginRight: 10}} component={Skeleton} width={140} height={48} />
    </Grid>
}

function LinkTab(props) {
    const {label, value, ...otherProps} = props
    return props.identifier ? <InternalLink passHref {...otherProps}><Tab label={label} value={value} /></InternalLink> : <Tab {...props} />
}

function TargetHeader(props) {
    const {target, pdsOnly} = props
    const classes = useStyles();

    if(!target) {
        return <AppBar className={`${classes.header} ${classes.target}`} position="static" color="inherit"><SkeletonBanner/><SkeletonTabBar/></AppBar>
    }
    
    const {display_name, title, image_url} = target
    const headerName = display_name && !pdsOnly ? display_name : title

    return  <AppBar className={`${classes.header} ${classes.target}`} position="static" color="inherit">
        <Banner name={headerName} image_url={image_url} />
    </AppBar>
}

function Banner({name, image_url}) {
    const classes = useStyles();
    return <Grid container direction="row" alignItems="center" className={classes.banner}>
        { image_url && <Grid item className={classes.headerImage} component="img" alt={"Image of " + name} src={image_url} /> }
        <Grid item component={Typography} variant="h1"> { name } Data Archive </Grid>
    </Grid>
}

function SkeletonBanner() {
    const classes = useStyles();
    return <Grid container direction="row" alignItems="center" className={classes.banner}>
        <Grid item style={{margin: 10}} component={Skeleton} variant="circle" width={140} height={140} />
        <Grid item component={Typography} variant="h1"> <Skeleton variant="text" width={400}/> </Grid>
    </Grid>
}

function Menu() {
    const classes = useStyles()
    return <Link href="/" className={classes.menu}><img alt="Menu icon" src="/images/menu.svg"/></Link>
}
export {MissionHeader, TargetHeader, Menu }