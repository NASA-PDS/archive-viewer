import React from 'react';
import { Link,  List as MaterialList, ListItem, ListItemText } from '@material-ui/core'
import { isPdsOnlyMode, isMockupMode } from 'api/mock.js'


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
    let url = `?identifier=${item.logical_identifier ? item.logical_identifier : item.identifier}`
    if(isPdsOnlyMode()) { url += "&pdsOnly=true" }
    if(isMockupMode() === "true") { url += "&mockup=true" }

    return (
        <ListItem button component={Link} href={url}>
            <ListItemText primary={ nameFinder(item) + ((displayTag && !!item.tags) ? ` - ${item.tags[0]}` : '')}/>
        </ListItem>
    )
}

function nameFinder(item) {
    return item.display_name ? item.display_name : item.title ? item.title : item.identifier
}


export { ContextList, ContextLink }