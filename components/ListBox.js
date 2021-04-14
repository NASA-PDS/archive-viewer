import React, { useState } from 'react';
import Loading from 'components/Loading.js'
import TangentAccordion from 'components/TangentAccordion'
import { List, ListItem, ListItemText, Collapse, Divider, makeStyles, Box } from '@material-ui/core';
import { groupByAttributedRelationship, groupByFirstTag, groupByRelatedItems, downplayGroupsThreshold, hiddenGroupsThreshold } from 'services/groupings'
import { ContextLink, ContextList } from 'components/ContextLinks'
import { ExpandLess, ExpandMore } from '@material-ui/icons'

/* ------ Constants ------ */
const maxExpandedListDefault = 15
const maxExpandedListCompact = 3
const listTypes = {
    dataset: 'dataset',
    mission: 'mission',
    target: 'target',
    relatedTarget: 'relatedTarget',
    instrument: 'instrument',
    spacecraft: 'spacecraft'
}
const listTypeValues = {
    [listTypes.dataset]: {
        title: 'Datasets',
        titleSingular: 'Dataset'
    },
    [listTypes.mission]: {
        title: 'Missions',
        titleSingular: 'Mission',
        fieldName: 'investigation_ref'
    },
    [listTypes.target]: {
        title: 'Targets',
        titleSingular: 'Target',
        fieldName: 'target_ref'
    },
    [listTypes.relatedTarget]: {
        title: 'Related Targets',
        titleSingular: 'Related Target',
        fieldName: 'target_ref'
    },
    [listTypes.instrument]: {
        title: 'Instruments',
        titleSingular: 'Instrument',
        fieldName: 'instrument_ref'
    },
    [listTypes.spacecraft]: {
        title: 'Spacecraft',
        titleSingular: 'Spacecraft',
        fieldName: 'instrument_host_ref'
    }
}

const useStyles = makeStyles((theme) => ({
    root: {
        maxWidth: 400
    }
}));

/* ------ Main Export Classes ------ */

function AbstractUnmemoizedListBox(props) {
    const {groupBy, groupInfo, type, groupingFn, items, active, hideHeader} = props
    const groupByField = groupBy ? listTypeValues[groupBy].fieldName : null
    const classes = useStyles()
    
    if(!items) { 
        return <Loading/> 
    } else if(items.length === 0) {
        return null
    } else {
        const header = !hideHeader ? (items.length === 1 ? listTypeValues[type].titleSingular : listTypeValues[type].title) : null
        const groups = groupingFn(items, groupInfo, groupByField)
        
        const defaultExpanded = 
            props.compact ? items.length <= maxExpandedListCompact
                          : items.length <= maxExpandedListDefault || groups.length > 1

        return <Box className={classes.root}>
            <GroupedList groups={groups} type={type} active={active}/>
        </Box>
    } 
}

// prevents re-renders when underlying items aren't actually changing
const AbstractListBox = React.memo(AbstractUnmemoizedListBox, (prevProps, newProps) => {
    if(!prevProps.items) { return false }
    if(!newProps.items) { return true }
    return prevProps.active === newProps.active && prevProps.items === newProps.items 
})


function DatasetListBox(props) {
    return <AbstractListBox type={listTypes.dataset} groupingFn={groupByRelatedItems} {...props}/>
}
function MissionListBox(props) {
    return <AbstractListBox type={listTypes.mission} groupingFn={groupByAttributedRelationship} {...props}/>
}
function TargetListBox(props) {
    return <AbstractListBox type={listTypes.target} groupingFn={groupByAttributedRelationship} {...props}/>
}
function RelatedTargetListBox(props) {
    return <AbstractListBox type={listTypes.relatedTarget} groupingFn={groupByFirstTag} {...props}/>
}
function InstrumentListBox(props) {
    return <AbstractListBox type={listTypes.instrument} groupingFn={groupByAttributedRelationship} {...props}/>
}
function SpacecraftListBox(props) {
    return <AbstractListBox type={listTypes.spacecraft} groupingFn={groupByAttributedRelationship} {...props}/>
}

export {listTypes as groupType, DatasetListBox, MissionListBox, TargetListBox, RelatedTargetListBox, InstrumentListBox, SpacecraftListBox}

/* ------ Internal Components ------ */

function GroupedList({groups, type, active}) {
    if (groups.length === 1) {
        return <ContextList items={groups[0].items} active={active}/>
    }
    let sortedGroups = groups.sort((a, b) => a.order < b.order ? -1 : 1)
    return sortedGroups.filter(group => Number.isInteger(group.order) ? group.order < hiddenGroupsThreshold : true).map((group, index) => 
        <GroupBox group={group} type={type} active={active} isMinor={Number.isInteger(group.order) ? group.order >= downplayGroupsThreshold : false} key={group.name} />
    )
}

function GroupBox({group, isMinor, active}) {
    const showToggle = isMinor || group.items.length > maxExpandedListDefault

    const { items, name } = group

    if(!items.length) {
        return <Typography variant="body" color="textSecondary">None found</Typography>
    }
    return showToggle 
        ?   <ToggleList header={name} headerVariant="h6" list={<ContextList items={items}/>}/>
        :   <List disablePadding>
                <ListItem><ListItemText primary={name} primaryTypographyProps={{variant: 'h6'}}/></ListItem>
                <ContextList items={items} active={active}/>
            </List>
    
}

function ToggleList({header, headerVariant, list, divider}) {
    const [expanded, setExpanded] = useState(false)
    const toggle = () => setExpanded(!expanded)

    return (
        <List disablePadding>
            <ListItem button onClick={toggle}>
                <ListItemText primary={header} primaryTypographyProps={{variant: headerVariant}}/>
                { expanded ? <ExpandLess /> : <ExpandMore/>}
            </ListItem>
            {divider && <Divider/>}
            <Collapse in={expanded} unmountOnExit>
            {list}
            </Collapse>
        </List>
    )
}