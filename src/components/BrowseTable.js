import React, {useState} from 'react';
import 'css/BrowseTable.scss'
import Loading from 'components/Loading.js'
import { Box, Link,  List as MaterialList, ListItem, ListItemText, Typography, Paper, TableContainer, Table, TableBody, TableRow, TableCell } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';

/* ------ Constants ------ */
const downplayGroupsThreshold = 100
const hiddenGroupsThreshold = 1000
const miscGroup = 'Other'

const useStyles = makeStyles((theme) => ({
    sectionHeader: {
      margin: theme.spacing(1)
    },
    table: {
        border: 0
    },
    cell: {
        borderLeft: 0,
        borderRight: 0
    }
}));

function BrowseTables(props) {
    const [expanded, setExpanded] = useState(false)
    const {items, sectioned, type} = props
    const classes = useStyles();

    if(!items) { return <Loading/>}
    let groups = groupByAttributedRelationship(items)
    groups.sort((a, b) => a.order < b.order ? -1 : 1)

    let minorGroups = [], majorGroups = []
    groups.forEach((group) => {
        if(Number.isInteger(group.order)) {
            if(group.order < downplayGroupsThreshold) { majorGroups.push(group) }
            else if(group.order < hiddenGroupsThreshold) { minorGroups.push(group) }
        }
    })
    
    if(majorGroups.length === 0 && minorGroups.length > 0) { setExpanded(true) }

    return (
        <Paper elevation={3} color="primary">
            {majorGroups.map(group => { return (
                <Box key={group.name}>
                    <Typography variant="h4" className={classes.sectionHeader}>{group.name} {group.order < downplayGroupsThreshold ? type : ''}</Typography>
                    { sectioned ? <SectionedTable items={group.items} /> : <List items={group.items} /> }
                </Box>
            )})}
            {expanded === false && minorGroups.length > 0 && 
                <Box className="browse-expand" onClick={() => setExpanded(true)}>See more</Box>
            }
            {expanded && minorGroups.map(group => { return (
                <Box key={group.name}>
                    <Typography variant="h4">{group.name} {group.order < downplayGroupsThreshold ? type : ''}</Typography>
                    { sectioned ? <SectionedTable items={group.items} /> : <List items={group.items} /> }
                </Box>
            )})}
        </Paper>
    )

}
export function SpacecraftBrowseTable(props) {
    return <BrowseTables type="Spacecraft" sectioned={false} {...props}/>
}
export function InstrumentBrowseTable(props) {
    return <BrowseTables type="Instruments" sectioned={true} {...props}/>
}

function SectionedTable({items}) {
    const classes = useStyles();
    let groups = groupByFirstTag(items)
    groups.sort((a, b) => a.order.localeCompare(b.order))
    return (
        <TableContainer>
            <Table padding="none" className={classes.table}>
                {groups.map(group => { return (
                    <TableRow key={group.name}>
                        <TableCell className={classes.cell} align="center" component="th" scope="row">
                            {(groups.length > 1 || group.name !== miscGroup) &&
                                <Typography variant="h6"> { group.name }</Typography>
                            }
                        </TableCell>
                        <TableCell className={classes.cell}>
                            <List items={group.items} />
                        </TableCell>
                    </TableRow>
                )})}
            </Table>
        </TableContainer>
    )
}


class Group {
    constructor(name, items, order) {
        this.name = name
        this.items = items
        this.order = order !== undefined ? order : name
    }
}

function nameFinder(item) {
    return item.display_name ? item.display_name : item.title
}

function List({items}) {    
    if(!items || !items.length) { return <NoItems/>}
    let sortedItems = items.sort((a, b) => {
        return nameFinder(a).localeCompare(nameFinder(b))
    })
    return (
        <MaterialList>
            {sortedItems.map((item,idx) => 
                <ItemLink key={item.identifier + idx} item={item} single={false}/>
            )}
        </MaterialList>
    )
}

function ItemLink({item, single}) {
    let url = `?identifier=${item.identifier}`
    return (
        <ListItem button component={Link} href={url}>
            <ListItemText primary={ nameFinder(item) }/>
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

const groupByAttributedRelationship = (items, relationshipInfo) => {
    let insert = (item, groupName, order) => {
        let existingGroup = groups.find(group => group.name === groupName)
        if (!!existingGroup) {existingGroup.items.push(item)}
        else groups.push(new Group(groupName, [item], order))
    }
    let groups = []

    // first insert any mandatory groups
    if(!!relationshipInfo) {
        for(let relationship of relationshipInfo) {
            if (relationship.order !== undefined && relationship.order < downplayGroupsThreshold) {
                groups.push(new Group(relationship.name, [], relationship.order))
            }
        }
    }
    for (let item of items) {

        // if possible, group by relationships already in data
        const relationship = item.relatedBy
        if(!!relationship) { insert(item, relationship.name, relationship.order) }
        else { insert(item, miscGroup, 999) }
        
    }
    return groups
}

const groupByFirstTag = (items) => {
    let insert = (item, groupName, order) => {
        let existingGroup = groups.find(group => group.name === groupName)
        if (!!existingGroup) {existingGroup.items.push(item)}
        else groups.push(new Group(groupName, [item], order))
    }
    let groups = []
    for (let item of items) {
        if(!item.tags || !item.tags.length) {
            insert(item, miscGroup, 'zzzzz')
        }
        else {
            insert(item, item.tags[0])
        }
    }
    return groups
}