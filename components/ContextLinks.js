import { Button, Card, CardActions, CardContent, Divider, List as MaterialList, ListItemButton, ListItemText, ThemeProvider, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import ExitToApp from '@mui/icons-material/ExitToApp';
import InternalLink from 'components/InternalLink';
import DarkTheme from 'DarkTheme';
import React from 'react';
import { groupByField } from 'services/groupings';
import Description from './Description';

const StyledCard = styled(Card)(({ theme }) => ({
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    [theme.breakpoints.up('sm')]: {
        display: 'flex',
        alignItems: 'flex-start',
        flexFlow: 'row nowrap',
    },
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

function ContextCard({item, themeColorKey, path, title, isMinor}) {
    const name = nameFinder(item)
    const dateString = new Date(item.start_date).toLocaleDateString() + (item.end_date ? ('—' + new Date(item.end_date).toLocaleDateString()) : '')

    let titleStyle = {marginTop: 0}
    if(!!item.start_date) { titleStyle.marginBottom = 0 }

    // context cards are always in dark mode to match headers
    return (
        <ThemeProvider theme={DarkTheme}>
            <StyledCard raised={true} sx={{ backgroundColor: (theme) => theme.custom[themeColorKey] }} p={1}>
                { item.image_url ? <StyledImg src={item.image_url} alt={'Banner for ' + name} title={name}/> : <ImgPlaceholder />} 
                <CardContentStyled p="1">
                    <Typography style={titleStyle} variant="h3" component="h2" gutterBottom>{name}</Typography>
                    {item.start_date && <Typography variant="body2" color="textSecondary" gutterBottom> { dateString } </Typography> }
                    <Description model={item}/>
                </CardContentStyled>
                { !isMinor && <CardActions>
                    <InternalLink identifier={item.identifier} additionalPath={path} passHref>
                        <Button color="primary" variant="contained" endIcon={<ExitToApp/>}>{title}</Button>
                    </InternalLink>
                </CardActions> }
            </StyledCard>
        </ThemeProvider>
    )
}

function TargetContextCardList(props) {
    return <ContextCardList themeColorKey="targetThemeColor" title="View Target" sorter={sortType.name} {...props}/>
}

function MissionContextCardList(props) {
    return <ContextCardList themeColorKey="missionThemeColor" path="instruments" title="View Data" sorter={sortType.date} {...props}/>
}


export { ContextList, ContextLink, TargetContextCardList, MissionContextCardList };
