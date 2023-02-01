import { Collapse, Divider, List, ListItem, ListItemText } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { ContextList, MissionContextCardList, TargetContextCardList } from 'components/ContextLinks';
import Loading from 'components/Loading.js';
import React, { useState } from 'react';
import { downplayGroupsThreshold, groupByAttributedRelationship, groupByFirstTag, hiddenGroupsThreshold } from 'services/groupings';

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

/* ------ Main Export Classes ------ */

function AbstractUnmemoizedGroupedList(props) {
    const {groupBy, groupInfo, type, groupingFn, items, ...otherProps} = props
    const groupByField = groupBy ? listTypeValues[groupBy].fieldName : null
    
    if(!items) { 
        return <Loading/> 
    } else if(items.length === 0) {
        return null
    } else {
        const groups = groupingFn(items, groupInfo, groupByField)

        return <GroupedList groups={groups} type={type} {...otherProps}/>
    } 
}

// prevents re-renders when underlying items aren't actually changing
const AbstractGroupedList = React.memo(AbstractUnmemoizedGroupedList, (prevProps, newProps) => {
    if(!prevProps.items) { return false }
    if(!newProps.items) { return true }
    return prevProps.active === newProps.active && prevProps.items === newProps.items 
})


// function DatasetGroupedList(props) {
//     return <AbstractGroupedList type={listTypes.dataset} groupingFn={groupByRelatedItems} {...props}/>
// }
function MissionGroupedList(props) {
    return <AbstractGroupedList type={listTypes.mission} groupingFn={groupByAttributedRelationship} listComponent={MissionContextCardList} {...props}/>
}
function TargetGroupedList(props) {
    return <AbstractGroupedList type={listTypes.target} groupingFn={groupByAttributedRelationship} listComponent={TargetContextCardList} {...props}/>
}
function RelatedTargetGroupedList(props) {
    return <AbstractGroupedList type={listTypes.relatedTarget} groupingFn={groupByFirstTag} listComponent={ContextList} {...props}/>
}
// function InstrumentGroupedList(props) {
//     return <AbstractGroupedList type={listTypes.instrument} groupingFn={groupByAttributedRelationship} {...props}/>
// }
function SpacecraftGroupedList(props) {
    return <AbstractGroupedList type={listTypes.spacecraft} groupingFn={groupByAttributedRelationship} listComponent={ContextList} {...props}/>
}

export { listTypes as groupType, MissionGroupedList, TargetGroupedList, RelatedTargetGroupedList, SpacecraftGroupedList };

/* ------ Internal Components ------ */

function GroupedList({groups, type, active, listComponent}) {
    if (groups.length === 1) {
        return React.createElement(listComponent, { items: groups[0].items, active})
    }
    let sortedGroups = groups.sort((a, b) => a.order < b.order ? -1 : 1)
    return sortedGroups.filter(group => Number.isInteger(group.order) ? group.order < hiddenGroupsThreshold : true).map((group, index) => 
        <GroupBox group={group} type={type} active={active} listComponent={listComponent} isMinor={Number.isInteger(group.order) ? group.order >= downplayGroupsThreshold : false} key={group.name} />
    )
}

function GroupBox({group, isMinor, active, listComponent}) {
    const showToggle = isMinor || group.items.length > maxExpandedListDefault

    const { items, name } = group

    const list = React.createElement(listComponent, {items, active, isMinor})

    return showToggle 
        ?   <ToggleList header={name} headerVariant="h6" list={list}/>
        :   <List disablePadding>
                <ListItem><ListItemText primary={name} primaryTypographyProps={{variant: 'h6'}}/></ListItem>
                {list}
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