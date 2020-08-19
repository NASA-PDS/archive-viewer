import React from 'react';
import { Box, Link,  List as MaterialList, ListItem, ListItemText } from '@material-ui/core'


function ContextList({items}) {    
    if(!items || !items.length) { return <NoItems/>}
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
    const url = `?identifier=${item.logical_identifier ? item.logical_identifier : item.identifier}`
    return (
        <ListItem button component={Link} href={url}>
            <ListItemText primary={ nameFinder(item) + ((displayTag && !!item.tags) ? ` - ${item.tags[0]}` : '')}/>
        </ListItem>
    )
}

function NoItems() {
    return (
        <Box>
            <p>None of this type</p>
        </Box>
    )
}

function nameFinder(item) {
    return item.display_name ? item.display_name : item.title
}


export { ContextList, ContextLink }