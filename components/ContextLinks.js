import React from 'react';
import { List as MaterialList, ListItem, ListItemText } from '@material-ui/core'
import InternalLink from 'components/InternalLink'


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


export { ContextList, ContextLink }