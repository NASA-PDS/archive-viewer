import React, {useState} from 'react';
import 'css/BrowseTable.scss'
import Loading from 'components/Loading.js'
import { ContextList } from 'components/ContextLinks'
import { Box, Typography, TableContainer, Table, TableRow, TableCell } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import { groupByAttributedRelationship, groupByFirstTag, miscGroupName, downplayGroupsThreshold, hiddenGroupsThreshold } from 'services/groupings'

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
        <Box>
            {majorGroups.map(group => { return (
                <Box key={group.name}>
                    <Typography variant="h2" className={classes.sectionHeader}>{group.name} {group.order < downplayGroupsThreshold ? type : ''}</Typography>
                    { sectioned ? <SectionedTable items={group.items} /> : <ContextList items={group.items} /> }
                </Box>
            )})}
            {expanded === false && minorGroups.length > 0 && 
                <Box className="browse-expand" onClick={() => setExpanded(true)}>See more</Box>
            }
            {expanded && minorGroups.map(group => { return (
                <Box key={group.name}>
                    <Typography variant="h3" component="h2">{group.name} {group.order < downplayGroupsThreshold ? type : ''}</Typography>
                    { sectioned ? <SectionedTable items={group.items} /> : <ContextList items={group.items} /> }
                </Box>
            )})}
        </Box>
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
                            {(groups.length > 1 || group.name !== miscGroupName) &&
                                <Typography variant="h6"> { group.name }</Typography>
                            }
                        </TableCell>
                        <TableCell className={classes.cell}>
                            <ContextList items={group.items} />
                        </TableCell>
                    </TableRow>
                )})}
            </Table>
        </TableContainer>
    )
}

