import React from 'react';
import { Button, Card, CardActions, CardContent, CardMedia, List as MaterialList, ListItem, ListItemText, makeStyles, Typography } from '@material-ui/core'
import InternalLink from 'components/InternalLink'
import Description from './Description';
import { ExitToApp } from '@material-ui/icons';


const useStyles = makeStyles((theme) => ({
    cardContent: {
        flex: 1
    },
    target: {
        backgroundColor: theme.custom.targetThemeColor
    },
    mission: {
        backgroundColor: theme.custom.missionThemeColor
    }
}));

function ContextList({items, active}) {    
    if(!items || !items.length) { return null}
    let sortedItems = items.sort((a, b) => {
        return nameFinder(a).localeCompare(nameFinder(b))
    })
    return (
        <MaterialList>
            {sortedItems.map((item,idx) => 
                <ContextLink key={item.identifier + '' +  idx} item={item} active={active}/>
            )}
        </MaterialList>
    )
}

function ContextLink({item, displayTag, active}) {
    return (
        <InternalLink identifier={item.logical_identifier ? item.logical_identifier : item.identifier} passHref>
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

function ContextButton({item, classType, path, title}) {
    const name = item.display_name || item.title
    const classes = useStyles();
    return (
        <Card raised={true} className={classType} p={1}>
            <CardContent className={classes.cardContent} p="1">
                <Typography style={{marginTop: 0}} variant="h3" component="h2" gutterBottom>{name}</Typography>
                <Description model={item}/>
            </CardContent>
            <CardActions>
                <InternalLink identifier={item.identifier} additionalPath={path} passHref>
                    <Button color="primary" variant="contained" endIcon={<ExitToApp/>}>{title}</Button>
                </InternalLink>
            </CardActions>
        </Card>
    )
}

function TargetContextButton({target}) {
    const classes = useStyles();
    return <ContextButton item={target} classType={classes.target} title="View Target"/>
}

function MissionContextButton({mission}) {
    const classes = useStyles();
    return <ContextButton item={mission} classType={classes.mission} path="instruments" title="View Data"/>
}


export { ContextList, ContextLink, TargetContextButton, MissionContextButton }