import { AppBar, Divider, Tab, Tabs, Typography, useTheme } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { styled, ThemeProvider } from '@mui/material/styles';
import Skeleton from '@mui/material/Skeleton';
import ErrorIcon from '@mui/icons-material/Error';
import DarkTheme from 'DarkTheme';
import React from 'react';
import LogicalIdentifier from 'services/LogicalIdentifier';
import { pagePaths, types } from 'services/pages.js';
import InternalLink from './InternalLink';

const Description = styled(Typography)(({ theme }) => ({
    whiteSpace: 'pre-line',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
}));

const Header = styled(AppBar)(({ theme }) => ({
    backgroundColor: theme.custom.missionThemeColor,
    zIndex: theme.zIndex.drawer + 1,
    display: 'flex',
    flexFlow: 'column nowrap',
}));

const TargetHeader = styled(Header)(({ theme }) => ({
    backgroundColor: theme.custom.targetThemeColor
}));

const ErrorHeader = styled(Header)(({ theme }) => ({
    backgroundColor: theme.palette.error.main
}));

const BannerContainer = styled(Grid)(({ theme }) => ({
    [theme.breakpoints.down('sm')]: {
        height: theme.custom.headerBanner.height.sm
    },
    [theme.breakpoints.up('md')]: {
        height: theme.custom.headerBanner.height.md
    },
}));

const BannerTitle = styled(Typography)(({ theme }) => ({
    [theme.breakpoints.up('md')]: {
        fontSize: '3.5rem',
    },
    marginLeft: theme.spacing(2),
}));

const HeaderImage = styled('img')(({ theme }) => ({
    padding: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
        height: theme.custom.headerBanner.height.sm,
    },
    [theme.breakpoints.up('md')]: {
        height: theme.custom.headerBanner.height.md,
    },
}));

const HeaderIcon = styled('span')(({ theme }) => ({
    padding: theme.spacing(1),
    '& svg': {
        [theme.breakpoints.down('sm')]: {
            fontSize: theme.custom.headerBanner.height.sm
        },
        [theme.breakpoints.up('md')]: {
            fontSize: theme.custom.headerBanner.height.md
        },
    }
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2)
}));

function MissionHeaderComponent(props) {
    const {page, mission, pdsOnly, ...otherProps} = props
    
    if(!mission) {
        return <Header position="static" color="inherit"><SkeletonBanner/><SkeletonTabBar tabCount={5}/></Header>
    }

    const {display_name, title, image_url} = mission
    const headerName = (display_name && !pdsOnly ? display_name : title)

    // headers are always in dark mode
    return <ThemeProvider theme={DarkTheme}>  
        <Header position="static" color="inherit">
            <Banner name={headerName + ' Data Archive'} image_url={image_url} />
            <MissionTabBar page={page} mission={mission} {...otherProps}/>
        </Header>
    </ThemeProvider>
}

function MissionTabBar({lidvid, page, mission, spacecraft, model}) {

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
            } else if(!!model.instrument_ref) {
                tabValue = types.MISSIONINSTRUMENTS
            } else {
                tabValue = types.MOREDATA
            }
            break
        }
        case types.INSTRUMENT: tabValue = types.MISSIONINSTRUMENTS; break;
        default: tabValue = page
    }

    return <Tabs value={tabValue} indicatorColor="secondary" textColor="secondary" variant="scrollable">
                <LinkTab label="Overview" value={types.MISSION} identifier={mission.identifier}/>
                <LinkTab label="Spacecraft" value={types.SPACECRAFT} identifier={spacecraft && spacecraft.length > 0 && spacecraft[0].identifier}/>
                <LinkTab label="Tools" value={types.MISSIONTOOLS} identifier={mission.identifier} additionalPath={pagePaths[types.MISSIONTOOLS]}/>
                <DividerWithoutInheritedProps orientation="vertical" flexItem />
                <LinkTab label="Instrument Data" value={types.MISSIONINSTRUMENTS} identifier={mission.identifier} additionalPath={pagePaths[types.MISSIONINSTRUMENTS]}/>
                <LinkTab label="Target & Derived Data" value={types.MISSIONTARGETS} identifier={mission.identifier} additionalPath={pagePaths[types.MISSIONTARGETS]}/>
                { mission.other_html ? 
                    <LinkTab label="More Data" value={types.MOREDATA} identifier={mission.identifier} additionalPath={pagePaths[types.MOREDATA]}/> 
                    : <Tab label="More Data" disabled/>
                }
                { mission.mission_bundle ? 
                    <LinkTab label="Mission Bundle" value={types.MISSIONBUNDLE} identifier={mission.mission_bundle}/>
                    : <Tab label="Mission Bundle" disabled/>
                }
            </Tabs>
}

function DividerWithoutInheritedProps({orientation, flexItem, ...otherProps}) {
    return <StyledDivider orientation={orientation} flexItem={flexItem} />
}

function SkeletonTabBar({tabCount}) {
    return <Grid container direction="row" sx={{ alignItems: 'center' }}>
        {
            Array(tabCount).fill().map((_, i) => <Skeleton key={i} style={{marginLeft: 10, marginRight: 10}} width={140} height={48} />)
        }
    </Grid>
}

function LinkTab(props) {
    const {label, value, ...otherProps} = props
    return <Tab label={label} value={value} component={InternalLink} {...otherProps}/>
}

function TargetHeaderComponent(props) {
    const {target, pdsOnly, page} = props

    if(!target) {
        return <TargetHeader position="static" color="inherit"><SkeletonBanner/><SkeletonTabBar/></TargetHeader>
    }
    
    const {display_name, title, image_url} = target
    const headerName = display_name && !pdsOnly ? display_name : title

    // headers are always in dark mode
    return <ThemeProvider theme={DarkTheme}>
        <TargetHeader position="static" color="inherit">
            <Banner name={headerName + ' Information Page'} image_url={image_url} />
            <TargetTabBar page={page} target={target} />
        </TargetHeader>
    </ThemeProvider>
}

function TargetTabBar({page, target}) {

    if(!target) { return <SkeletonTabBar tabCount={4}/>}

    return <Tabs value={page} textColor="secondary" variant="scrollable">
                <LinkTab label="Overview" value={types.TARGET} identifier={target.identifier}/>
                <LinkTab label="Related" value={types.TARGETRELATED} identifier={target.identifier} additionalPath={pagePaths[types.TARGETRELATED]}/>
                <LinkTab label="Tools" value={types.TARGETTOOLS} identifier={target.identifier} additionalPath={pagePaths[types.TARGETTOOLS]}/>
                <DividerWithoutInheritedProps orientation="vertical" flexItem />
                <LinkTab label="Derived Data" value={types.TARGETDATA} identifier={target.identifier} additionalPath={pagePaths[types.TARGETDATA]}/>
                <LinkTab label="Mission Data" value={types.TARGETMISSIONS} identifier={target.identifier} additionalPath={pagePaths[types.TARGETMISSIONS]}/>
                <LinkTab label="More Data" value={types.MOREDATA} identifier={target.identifier} additionalPath={pagePaths[types.MOREDATA]}/>
            </Tabs>
}

function ErrorHeaderComponent() {
    return (
        <ThemeProvider theme={DarkTheme}>
            <ErrorHeader position="static" color="inherit">
                <Banner name={"Error"} icon={ErrorIcon}/>
            </ErrorHeader>
        </ThemeProvider>
    )
}

function Banner({name, image_url, icon}) {
    const theme = useTheme()
    return <BannerContainer container direction="row" wrap="nowrap" sx={{ alignItems: 'center' }}>
        { image_url && <HeaderImage alt={"Image of " + name} src={image_url} /> }
        { icon && React.createElement(icon, { sx: { 
            padding: theme.spacing(1),
            [theme.breakpoints.down('sm')]: {
                fontSize: theme.custom.headerBanner.height.sm
            },
            [theme.breakpoints.up('md')]: {
                fontSize: theme.custom.headerBanner.height.md
            },
        }, htmlColor: theme.palette.text.primary}) }
        <BannerTitle variant="h1"> { name } </BannerTitle>
    </BannerContainer>
}

function SkeletonBanner() {
    return <BannerContainer container direction="row" sx={{ alignItems: 'center' }}>
        <Skeleton style={{margin: 10}} variant="circular" width={140} height={140} />
        <Typography variant="h1"><Skeleton variant="text" width={400}/></Typography>
    </BannerContainer>
}

export { MissionHeaderComponent as MissionHeader, TargetHeaderComponent as TargetHeader, ErrorHeaderComponent as ErrorHeader };
