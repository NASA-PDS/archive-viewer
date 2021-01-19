import React, { useState } from 'react';
import { Helmet } from 'react-helmet'
import { Grid, Typography, Link } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    description: {
        whiteSpace: 'pre-line',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2)
    },
    header: {
        boxSizing: 'content-box',
        [theme.breakpoints.down('sm')]: {
            height: '75px'
        },
        [theme.breakpoints.up('md')]: {
            height: '160px'
        },
        padding: theme.spacing(2)
    },
    headerImage: {
        height: "100%"
    },
    targetHeader: {
        backgroundColor: theme.palette.common.black
    },
    spacecraftHeader: {
        backgroundColor: theme.palette.common.black
    },
    missionHeader: {
        backgroundColor: "#085898"
    },
    instrumentHeader: {
        backgroundColor: theme.palette.grey[600]
    },
    subheader: {
        height: 75,
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2)
    }
}));

function Header(props) {
    const {model,type} = props
    const {display_name, title, image_url} = model
    const name = display_name ? display_name : title
    const pageTitle = name + ' - PDS Archive Viewer'
    const classes = useStyles();
    return <>
        <Helmet>
            <title>{ pageTitle }</title>
            <meta charSet="utf-8" />
        </Helmet>
        <Grid container spacing={2} component="header" direction="row" alignItems="center" className={`${classes.header} ${classes[type + 'Header']} ${type === "spacecraft" ? classes.subheader : ''}`}>
            { image_url && <Grid item className={classes.headerImage} component="img" alt={"Image of " + name} src={image_url} /> }
            <Grid item component={Typography} variant="h1"> { name } Data Archive </Grid>
        </Grid>
    </>
}

function TargetHeader(props) {
    return <Header type="target" {...props}/>
}
function SpacecraftHeader(props) {
    return <Header type="spacecraft" {...props}/>
}
function InstrumentHeader(props) {
    return <Header type="instrument" {...props}/>
}
function MissionHeader(props) {
    return <Header type="mission" {...props}/>
}
function DatasetHeader(props) {
    return <Header type="dataset" {...props}/>
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
                {description}{alwaysShow ? null : <Link onClick={ () => setExpanded(false) }>Hide Description</Link>}
            </> : <>
                {description.length < previewLength ? description : (<>{shorten(description)}<Link onClick={ () => setExpanded(true) }>Show Description</Link></>)}
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
    return <Link href="/"><a className="menu-link"><img alt="Menu icon" src="/images/menu.svg"/></a></Link>
}
export {TargetHeader, SpacecraftHeader, InstrumentHeader, MissionHeader, DatasetHeader,
    TargetDescription, SpacecraftDescription, InstrumentDescription, MissionDescription, DatasetDescription, 
    Menu }