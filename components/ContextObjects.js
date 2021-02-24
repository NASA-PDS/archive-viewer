import React, { useState, useEffect } from 'react';
import { Grid, Typography, Link, AppBar, Tabs, Tab } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import InternalLink from './InternalLink';
import { getInstrumentsForSpacecraft } from 'api/spacecraft';

const useStyles = makeStyles((theme) => ({
    description: {
        whiteSpace: 'pre-line',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2)
    },
    header: {
        backgroundColor: "#085898",
        zIndex: theme.zIndex.drawer + 1,
        [theme.breakpoints.down('sm')]: {
            height: theme.custom.header.height.sm
        },
        [theme.breakpoints.up('md')]: {
            height: theme.custom.header.height.md
        },
        display: 'flex',
        flexFlow: 'column nowrap',
    },
    banner: {
        minHeight: 0,
        flexGrow: 1
    },
    headerImage: {
        padding: '8px',
        height: '100%'
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
    const {type, mission, pdsOnly} = props
    const classes = useStyles();
    
    if(!mission) {
        return <AppBar className={classes.header} position="fixed" color="inherit"></AppBar>
    }

    const {display_name, title, image_url} = mission
    const headerName = (display_name && !pdsOnly ? display_name : title)

    return <AppBar className={classes.header} position="fixed" color="inherit">
        <Banner name={headerName} image_url={image_url} />
        <TabBar type={type} mission={mission} />
    </AppBar>
}

function TabBar({type, mission}) {
    const [instruments, setInstruments] = useState(null)

    if(!mission) { return <Tabs />}

    let spacecraft = mission.instrument_host_ref && mission.instrument_host_ref.length > 0 ? mission.instrument_host_ref[0] : null
    useEffect(() => {
        getInstrumentsForSpacecraft(spacecraft).then(setInstruments, console.error)

        return function cleanup() { 
            setInstruments(null)
        }
    }, [spacecraft])

    return <Tabs value={type}>
                <LinkTab label="Overview" value="mission" identifier={mission.identifier}/>
                <LinkTab label="Spacecraft" value="spacecraft" identifier={spacecraft}/>
                <LinkTab label="Instruments" value="instrument" identifier={instruments && instruments.length > 0 ? instruments[0].identifier : null}/>
            </Tabs>
}

function LinkTab(props) {
    const {label, value, ...otherProps} = props
    return props.identifier ? <InternalLink passHref {...otherProps}><Tab label={label} value={value} /></InternalLink> : <Tab {...props} />
}

function TargetHeader(props) {
    const {target, pdsOnly} = props
    const classes = useStyles();

    if(!target) {
        return <AppBar className={`${classes.header} ${classes.target}`} position="fixed" color="inherit"></AppBar>
    }
    
    const {display_name, title, image_url} = target
    const headerName = display_name && !pdsOnly ? display_name : title

    return  <AppBar className={`${classes.header} ${classes.target}`} position="fixed" color="inherit">
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

const ridiculousLength = 100
const previewLength = 750


function Description(props) {
    const {type, model} = props
    const {display_description} = model
    const description = !!display_description ? display_description : (model[`${type}description`] ? model[`${type}description`] : '')
    const alwaysShow = description.length < ridiculousLength
    const [expanded, setExpanded] = useState(alwaysShow)
    const classes = useStyles();

    return (
        <Typography variant="body1" className={classes.description}>
            { !description ? 'No description is available.' : expanded ? <>
                {description}{alwaysShow ? null : <Link onClick={ () => setExpanded(false) }>Hide</Link>}
            </> : <>
                {description.length < previewLength ? description : (<>{shorten(description)}<Link onClick={ () => setExpanded(true) }>...Show More</Link></>)}
            </>}
        </Typography>
    )  
}

function shorten(description) {
    return description.split('').splice(0,previewLength).join('') + '... '
}

function TargetDescription(props) {
    return <Description type="target_" {...props}/>
}
function SpacecraftDescription(props) {
    return <Description type="instrument_host_" {...props}/>
}
function InstrumentDescription(props) {
    return <Description type="instrument_" {...props}/>
}
function MissionDescription(props) {
    return <Description type="investigation_" {...props}/>
}
function DatasetDescription(props) {
    return <Description type="" {...props}/>
}

function Menu() {
    const classes = useStyles()
    return <Link href="/" className={classes.menu}><img alt="Menu icon" src="/images/menu.svg"/></Link>
}
export {MissionHeader, TargetHeader,
    TargetDescription, SpacecraftDescription, InstrumentDescription, MissionDescription, DatasetDescription, 
    Menu }