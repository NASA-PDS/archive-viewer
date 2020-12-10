import React from 'react';
import { List as MaterialList, ListItem, ListItemText } from '@material-ui/core'
import InternalLink from 'components/InternalLink'


function ContextList({items}) {    
    if(!items || !items.length) { return null}
    let sortedItems = items.sort((a, b) => {
        return nameFinder(a).localeCompare(nameFinder(b))
    })
    return (
        <MaterialList>
            {sortedItems.map((item,idx) => 
                <ContextLink key={item.identifier + idx} item={item}/>
            )}
        </MaterialList>
    )
}

function ContextLink({item, displayTag}) {
    return (
        <InternalLink identifier={item.logical_identifier ? item.logical_identifier : item.identifier} passHref>
        <ListItem button component="a" >
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