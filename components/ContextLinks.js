import { Button, Card, CardActions, CardContent, CardMedia, Divider, List as MaterialList, ListItem, ListItemText, makeStyles, ThemeProvider, Typography, Box, Grid, List } from '@material-ui/core';
import { ExitToApp } from '@material-ui/icons';
import InternalLink from 'components/InternalLink';
import DarkTheme from 'DarkTheme';
import React from 'react';
import { groupByField } from 'services/groupings';
import Description from './Description';
import { pagePaths, types } from 'services/pages.js';


const useStyles = makeStyles((theme) => ({
    card: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        [theme.breakpoints.up('sm')]: {
            display: 'flex',
            alignItems: 'flex-start',
            flexFlow: 'row nowrap',
        },
    },
    smallCard: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        marginLeft: theme.spacing(1),
        [theme.breakpoints.up('sm')]: {
            display: 'flex',
            alignItems: 'center',
            flexFlow: 'column nowrap',
        },
        maxWidth: 300
    },
    cardContent: {
        flex: 1
    },
    target: {
        backgroundColor: theme.custom.targetThemeColor
    },
    mission: {
        backgroundColor: theme.custom.missionThemeColor
    },
    img: {
        width: 80,
        margin: theme.spacing(1)
    }
}));

const sortType = {
    name: (a, b) => nameFinder(a).localeCompare(nameFinder(b)),
    date: (a, b) => new Date(a.start_date || 0) - new Date(b.start_date || 0)
}


function ContextList({items, active, separateBy, orderBy}) {    
    if(!items || !items.length) { return null}

    if(!!separateBy) {
        const groups = groupByField(items, separateBy, orderBy).sort((a, b) => a.order - b.order)
        return (
            <>
                {groups.map((group, index) => (
                    <div key={index}>
                        <ContextList items={group.items} />
                        { (index + 1) < groups.length && <Divider/> }
                    </div>
                ))}
            </>
        )
    }

    else {
        items.sort(sortType.name)
        return (
            <MaterialList>
                {items.map((item,idx) => 
                    <ContextLink key={item.identifier + '' +  idx} item={item} active={active}/>
                )}
            </MaterialList>
        )
    }
}

function ContextLink({item, displayTag, active}) {
    return (
        <InternalLink identifier={item.identifier} passHref>
        <ListItem button component="a" selected={active === item.identifier}>
            <ListItemText primary={ nameFinder(item) + ((displayTag && !!item.tags) ? ` - ${item.tags[0]}` : '')} 
            primaryTypographyProps={{color: "primary"}}/>
        </ListItem>
        </InternalLink>
    )
}

function nameFinder(item) {
    return item.display_name ? item.display_name : item.title ? item.title : item.identifier
}

function ContextCardList({items, sorter, ...otherProps}) {    
    if(!items || !items.length) { return null}
    let sortedItems = items.sort(sorter)
    return (
        <>
            {sortedItems.map((item,idx) => 
                <ContextCard key={item.identifier + '' +  idx} item={item} {...otherProps} />
            )}
        </>
    )
}

function ContextCard({item, classType, actions, small, isMinor}) {
    const name = nameFinder(item)
    const dateString = new Date(item.start_date).toLocaleDateString() + (item.end_date ? ('—' + new Date(item.end_date).toLocaleDateString()) : '')
    const classes = useStyles();

    let titleStyle = {marginTop: 0}
    if(!!item.start_date) { titleStyle.marginBottom = 0 }

    // context cards are always in dark mode to match headers
    return (
        <ThemeProvider theme={DarkTheme}>
            <Card raised={true} className={`${small ? classes.smallCard : classes.card} ${classType}`} p={1}>
                { item.image_url ? <img className={classes.img} src={item.image_url} alt={'Banner for ' + name} title={name}/> : <div className={classes.img}/>} 
                <CardContent className={classes.cardContent} p="1">
                    <Typography style={titleStyle} variant="h3" component="h2" gutterBottom>{name}</Typography>
                    {item.start_date && <Typography variant="body2" color="textSecondary" gutterBottom> { dateString } </Typography> }
                    {!small && <Description model={item}/>}
                </CardContent>
                { !isMinor && <Grid container direction='column' alignItems='stretch' justify='space-between' style={{marginTop: 16, marginRight: 16, width: 'unset'}}>
                    { actions.map(({title, path, primary}) => 
                        <Grid component={InternalLink} item key={item.identifier} identifier={item.identifier} additionalPath={path} passHref>
                            <Button color="primary" variant={primary ? 'contained' : 'outline'} endIcon={<ExitToApp/>} style={{marginBottom: 8, justifyContent: 'space-between'}} >{title}</Button>
                        </Grid>
                    )}
                </Grid> }
            </Card>
        </ThemeProvider>
    )
}


function TargetContextCardList(props) {
    const classes = useStyles();
    return <ContextCardList classType={classes.target} sorter={sortType.name} actions={[
        {title: 'View Derived Data', path: pagePaths[types.TARGETDATA], primary: true},
        {title: 'View Overview'},
        {title: 'View Tools', path: pagePaths[types.TARGETTOOLS]},
    ]} {...props}/>
}

function MissionContextCardList(props) {
    const classes = useStyles();
    return <ContextCardList classType={classes.mission} path="instruments" title="View Data" sorter={sortType.date} actions={[
        {title: 'View Instrument Data', path: pagePaths[types.MISSIONINSTRUMENTS], primary: true},
        {title: 'View More Data', path: pagePaths[types.MOREDATA], primary: true},
        {title: 'View Overview'},
        {title: 'View Tools', path: pagePaths[types.MISSIONTOOLS]},
    ]} {...props}/>
}


function TargetDataCardList(props) {
    const classes = useStyles();
    return <ContextCardList classType={classes.target} sorter={sortType.name} small={true} actions={[
        {title: 'View Derived Data', path: 'data'},
    ]} {...props}/>
}

export { ContextList, ContextLink, TargetContextCardList, MissionContextCardList, TargetDataCardList };
