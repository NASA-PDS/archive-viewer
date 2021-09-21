import { Button, Card, CardActions, CardContent, CardMedia, Divider, List as MaterialList, ListItem, ListItemText, makeStyles, SvgIcon, ThemeProvider, Typography } from '@material-ui/core';
import { ExitToApp } from '@material-ui/icons';
import InternalLink from 'components/InternalLink';
import DarkTheme from 'DarkTheme';
import React from 'react';
import { groupByField } from 'services/groupings';
import Description from './Description';


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
        height: 'unset',
        margin: theme.spacing(1),
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

function ContextCard({item, classType, path, title, isMinor, defaultIcon}) {
    const name = nameFinder(item)
    const dateString = new Date(item.start_date).toLocaleDateString() + (item.end_date ? ('—' + new Date(item.end_date).toLocaleDateString()) : '')
    const classes = useStyles();

    let titleStyle = {marginTop: 0}
    if(!!item.start_date) { titleStyle.marginBottom = 0 }

    // context cards are always in dark mode to match headers
    return (
        <ThemeProvider theme={DarkTheme}>
            <Card raised={true} className={`${classes.card} ${classType}`} p={1}>
                { item.image_url
                    ? <img className={classes.img} src={item.image_url} alt={'Banner for ' + name} title={name}/> 
                    : defaultIcon } 
                <CardContent className={classes.cardContent} p="1">
                    <Typography style={titleStyle} variant="h3" component="h2" gutterBottom>{name}</Typography>
                    {item.start_date && <Typography variant="body2" color="textSecondary" gutterBottom> { dateString } </Typography> }
                    <Description model={item}/>
                </CardContent>
                { !isMinor && <CardActions>
                    <InternalLink identifier={item.identifier} additionalPath={path} passHref>
                        <Button color="primary" variant="contained" endIcon={<ExitToApp/>}>{title}</Button>
                    </InternalLink>
                </CardActions> }
            </Card>
        </ThemeProvider>
    )
}

function TargetContextCardList(props) {
    const classes = useStyles();
    return <ContextCardList classType={classes.target} title="View Target" sorter={sortType.name} defaultIcon={<TargetDefaultIcon/>} {...props}/>
}

function TargetDefaultIcon() {
    const classes = useStyles();
    return <SvgIcon color="disabled" className={classes.img}>
        <path d="M12.001,0C9.114,0,6.319,1.049,4.13,2.956C4.001,3.068,3.939,3.238,3.964,3.409C3.981,3.521,4,3.633,4,3.75    c0,1.184-0.931,2.166-2.12,2.235c-0.172,0.01-0.327,0.108-0.41,0.259C0.508,8-0.001,9.992-0.001,12c0,6.617,5.383,12,12,12    c2.542,0,4.898-0.8,6.841-2.154c0.053-0.027,0.1-0.062,0.141-0.106c2.081-1.495,3.668-3.629,4.459-6.12    c0.001-0.003,0.002-0.005,0.003-0.007c0.361-1.141,0.558-2.355,0.558-3.614C24.001,5.383,18.618,0,12.001,0z M11.501,21    c-0.827,0-1.5-0.673-1.5-1.5c0-0.827,0.673-1.5,1.5-1.5c0.827,0,1.5,0.673,1.5,1.5C13.001,20.326,12.328,21,11.501,21z     M13.501,13.5c-0.551,0-1-0.449-1-1c0-0.551,0.449-1,1-1c0.551,0,1,0.449,1,1C14.501,13.05,14.052,13.5,13.501,13.5z     M18.513,20.845c-1.466-0.436-2.512-1.8-2.512-3.346c0-1.93,1.57-3.5,3.5-3.5c1.165,0,2.253,0.593,2.9,1.554    C21.668,17.691,20.297,19.529,18.513,20.845z"/>
    </SvgIcon>
}

function MissionContextCardList(props) {
    const classes = useStyles();
    return <ContextCardList classType={classes.mission} path="instruments" title="View Data" sorter={sortType.date} defaultIcon={<MissionDefaultIcon/>} {...props}/>
}

function MissionDefaultIcon() {
    const classes = useStyles();
    return <SvgIcon color="disabled" className={classes.img}>
        <path d="M 6.1073 9.4458 l -2.2267 2.2261 L 0 7.7902 l 2.2267 -2.2261 z m 5.5653 -5.5652 l -2.2257 2.227 l -3.8828 -3.8806 L 7.7899 0 z m 0.5811 16.1652 l 2.2255 -2.2261 l 3.8823 3.8811 l -2.2255 2.2261 z m 5.5666 -5.5673 l 2.2264 -2.2264 l 3.8811 3.8811 l -2.2264 2.2264 z M 19.4739 0.5499 L 12.7949 7.2289 l -0.5557 -0.5565 c -0.3086 -0.3086 -0.806 -0.3086 -1.1138 0 l -1.113 1.113 l -5.0031 -5.0031 L 2.7824 5.0083 l 3.8823 3.8823 l 1.113 -1.113 l 1.1224 1.1224 l -4.4529 4.4521 c -0.3077 0.3086 -0.3077 0.8053 0 1.113 l 5.0095 5.0095 a 0.785 0.785 90 0 0 1.113 0 l 4.4521 -4.4529 l 1.1288 1.1288 l -1.113 1.113 l 3.8814 3.8823 l 2.2261 -2.2261 l -5.0086 -5.0086 l 1.113 -1.113 c 0.3077 -0.3086 0.3077 -0.8053 0 -1.113 l -0.5565 -0.5565 L 23.371 4.4494 c 0.3094 -0.3094 0.2999 -0.8139 -0.0094 -1.1224 L 20.579 0.5444 c -0.307 -0.311 -0.7958 -0.3023 -1.1052 0.0055 z m -6.679 8.9058 l -5.5652 5.5652 l -1.1138 -1.113 l 5.5659 -5.5659 z M 20.5869 2.776 L 14.4644 8.8984 l -0.5565 -0.5565 L 20.0303 2.2194 z"/>
    </SvgIcon>
}


export { ContextList, ContextLink, TargetContextCardList, MissionContextCardList };
