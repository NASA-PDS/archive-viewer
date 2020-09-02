import React, { useState } from 'react';
import Loading from 'components/Loading.js'
import { List, ListItem, ListItemText, Collapse, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { groupByAttributedRelationship, groupByFirstTag, groupByRelatedItems, downplayGroupsThreshold, hiddenGroupsThreshold } from 'services/groupings'
import { ContextLink, ContextList } from 'components/ContextLinks'
import { ExpandLess, ExpandMore } from '@material-ui/icons'

/* ------ Constants ------ */
const maxExpandedListDefault = 15
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

function AbstractListBox(props) {
    const {groupBy, groupInfo, type, groupingFn, items} = props
    const groupByField = groupBy ? listTypeValues[groupBy].fieldName : null

    const showToggle = !!items && items.length > maxExpandedListDefault

    if(!items) { 
        return <Loading/> 
    } else if(items.length === 0) {
        return null
    } else {
        const header = items.length === 1 ? listTypeValues[type].titleSingular : listTypeValues[type].title
        const groups = groupingFn(items, groupInfo, groupByField)
        const list = items.length === 1
                    ? <ContextLink item={items[0]}/> 
                    : <GroupedList groups={groups} type={type}/>
        return showToggle && groups.length === 1
            ? <ToggleList  
                    header={header} 
                    headerVariant="h3" 
                    list={list}
                    divider={true}/>
            : <List disablePadding>
                <ListItem>
                        <ListItemText 
                            primary={header}
                            primaryTypographyProps={{variant: 'h3'}}>
                        </ListItemText>
                    </ListItem>
                <Divider/>
                {list}
            </List>
        
    } 
}


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

function GroupedList({groups, type}) {
    if (groups.length === 1) {
        return <ContextList items={groups[0].items}/>
    }
    let sortedGroups = groups.sort((a, b) => a.order < b.order ? -1 : 1)
    return sortedGroups.filter(group => Number.isInteger(group.order) ? group.order < hiddenGroupsThreshold : true).map((group, index) => 
        <GroupBox group={group} type={type} isMinor={Number.isInteger(group.order) ? group.order >= downplayGroupsThreshold : false} key={group.name} />
    )
}

function GroupBox({group, isMinor}) {
    const showToggle = isMinor || group.items.length > maxExpandedListDefault

    const { items, name } = group

    if(!items.length) {
        return null
    }
    return showToggle 
        ?   <ToggleList header={name} headerVariant="h6" list={<ContextList items={items}/>}/>
        :   <List disablePadding>
                <ListItem><ListItemText primary={name} primaryTypographyProps={{variant: 'h6'}}/></ListItem>
                <ContextList items={items} />
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
            <Collapse in={expanded}>
            {list}
            </Collapse>
        </List>
    )
}