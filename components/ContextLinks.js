import { Button, Card, CardContent, Divider, List as MaterialList, ListItemButton, ListItemText, ThemeProvider, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { styled } from '@mui/material/styles';
import ExitToApp from '@mui/icons-material/ExitToApp';
import InternalLink from 'components/InternalLink';
import DarkTheme from 'DarkTheme';
import React from 'react';
import { groupByField } from 'services/groupings';
import Description from './Description';
import { pagePaths, types } from 'services/pages.js';

const StyledCard = styled(Card)(({ theme }) => ({
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    [theme.breakpoints.up('sm')]: {
        display: 'flex',
        alignItems: 'flex-start',
        flexFlow: 'row nowrap',
    },
}));

const SmallCard = styled(Card)(({ theme }) => ({
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    marginLeft: theme.spacing(1),
    [theme.breakpoints.up('sm')]: {
        display: 'flex',
        alignItems: 'center',
        flexFlow: 'column nowrap',
    },
    maxWidth: 300
}));

const CardContentStyled = styled(CardContent)({
    flex: 1
});

const StyledImg = styled('img')(({ theme }) => ({
    width: 80,
    margin: theme.spacing(1)
}));

const ImgPlaceholder = styled('div')(({ theme }) => ({
    width: 80,
    margin: theme.spacing(1)
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
        // <InternalLink identifier={item.identifier} passHref>
        <ListItemButton component={InternalLink} identifier={item.identifier} selected={active === item.identifier}>
            <ListItemText primary={ nameFinder(item) + ((displayTag && !!item.tags) ? ` - ${item.tags[0]}` : '')} 
            slotProps={{ primary: { color: 'primary' } }}/>
        </ListItemButton>
        // </InternalLink>
    )
}

function nameFinder(item) {
    const existsAndIsString = (val) => val !== undefined && val !== null && (typeof val === 'string' || val instanceof String)
    if(existsAndIsString(item.display_name)) return item.display_name
    if(existsAndIsString(item.title)) return item.title
    if(existsAndIsString(item.lidvid)) return item.lidvid
    if(existsAndIsString(item.identifier)) return item.identifier
    if(item.identifier instanceof Array && item.identifier.length > 0) return item.identifier[0]
    return item + "";
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

function ContextCard({item, themeColorKey, actions, small, isMinor}) {
    const name = nameFinder(item)
    const dateString = new Date(item.start_date).toLocaleDateString() + (item.end_date ? ('—' + new Date(item.end_date).toLocaleDateString()) : '')

    let titleStyle = {marginTop: 0}
    if(!!item.start_date) { titleStyle.marginBottom = 0 }

    const CardComponent = small ? SmallCard : StyledCard;

    // context cards are always in dark mode to match headers
    return (
        <ThemeProvider theme={DarkTheme}>
            <CardComponent raised={true} sx={{ backgroundColor: (theme) => theme.custom[themeColorKey] }} p={1}>
                { item.image_url ? <StyledImg src={item.image_url} alt={'Banner for ' + name} title={name}/> : <ImgPlaceholder />} 
                <CardContentStyled p="1">
                    <Typography style={titleStyle} variant="h3" component="h2" gutterBottom>{name}</Typography>
                    {item.start_date && <Typography variant="body2" color="textSecondary" gutterBottom> { dateString } </Typography> }
                    {!small && <Description model={item}/>}
                </CardContentStyled>
                { !isMinor && <Grid container direction='column' sx={{ alignItems: 'stretch', justifyContent: 'space-between', marginTop: 2, marginRight: 2, width: 'unset' }}>
                    { actions.map(({title, path, primary}) => 
                        <Grid key={title} component={InternalLink} identifier={item.identifier} additionalPath={path}>
                            <Button color="primary" variant={primary ? 'contained' : 'outlined'} endIcon={<ExitToApp/>} sx={{ marginBottom: 1, justifyContent: 'space-between' }}>{title}</Button>
                        </Grid>
                    )}
                </Grid> }
            </CardComponent>
        </ThemeProvider>
    )
}


function TargetContextCardList(props) {
    return <ContextCardList themeColorKey="targetThemeColor" sorter={sortType.name} actions={[
        {title: 'View Derived Data', path: pagePaths[types.TARGETDATA], primary: true},
        {title: 'View Overview'},
        {title: 'View Tools', path: pagePaths[types.TARGETTOOLS]},
    ]} {...props}/>
}

function MissionContextCardList(props) {
    return <ContextCardList themeColorKey="missionThemeColor" sorter={sortType.date} actions={[
        {title: 'View Instrument Data', path: pagePaths[types.MISSIONINSTRUMENTS], primary: true},
        {title: 'View More Data', path: pagePaths[types.MOREDATA], primary: true},
        {title: 'View Overview'},
        {title: 'View Tools', path: pagePaths[types.MISSIONTOOLS]},
    ]} {...props}/>
}


function TargetDataCardList(props) {
    return <ContextCardList themeColorKey="targetThemeColor" sorter={sortType.name} small={true} actions={[
        {title: 'View Derived Data', path: 'data'},
    ]} {...props}/>
}

export { ContextList, ContextLink, TargetContextCardList, MissionContextCardList, TargetDataCardList };
