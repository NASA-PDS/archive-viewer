import React, { useState } from 'react';
import 'css/ListBox.scss'
import Loading from 'components/Loading.js'
import { List, ListItem, ListItemText, Collapse, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { groupByAttributedRelationship, groupByFirstTag, groupByRelatedItems, downplayGroupsThreshold, hiddenGroupsThreshold } from 'services/groupings'
import { ContextLink, ContextList } from 'components/ContextLinks'
import { ExpandLess, ExpandMore } from '@material-ui/icons'

/* ------ Constants ------ */
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

/* ------------- CSS --------------- */

const useStyles = makeStyles((theme) => ({
    titleBox: {
        alignItems: 'baseline',
    }
}));

/* ------ Main Export Classes ------ */

function AbstractListBox(props) {
    const {groupBy, groupInfo, type, groupingFn, items} = props
    const groupByField = groupBy ? listTypeValues[groupBy].fieldName : null
    const classes = useStyles()

    if(!items) { 
        return <Loading/> 
    } else if(items.length === 0) {
        return <NoItems type={type}/>
    } else {
        const singular = items.length === 1
        return (
            <List>
                <ListItem className={classes.titleBox}>
                    <ListItemText 
                        primary={singular ? listTypeValues[type].titleSingular : listTypeValues[type].title}
                        primaryTypographyProps={{variant: 'h5'}}
                        secondary={!singular && items.length}>
                    </ListItemText>
                </ListItem>
                <Divider/>
                {
                    items.length === 1
                    ? <ContextLink item={items[0]}/> 
                    : <GroupedList groups={groupingFn(items, groupInfo, groupByField)} type={type}/>
                }
            </List>
        )
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

function GroupBox({group, type, isMinor}) {
    const showToggle = isMinor
    const [expanded, setExpanded] = useState(!isMinor)
    const toggle = () => setExpanded(!expanded)

    const { items, name } = group

    if(!items.length) {
        return <NoItems type={type} descriptor={name} />
    }
    return (
        <List disablePadding>
            {showToggle 
                ?<ListItem button onClick={ toggle }>
                    <ListItemText primary={name} primaryTypographyProps={{variant: 'h6'}}/>
                    { expanded ? <ExpandLess /> : <ExpandMore/>}
                </ListItem>
                : 
                <ListItem><ListItemText primary={name} primaryTypographyProps={{variant: 'h6'}}/></ListItem>
            }
            <Collapse in={expanded}>
                <ContextList items={items} />
            </Collapse>
        </List>
    )
}



function NoItems({type, descriptor}) {
    return (
        <div className="no-items">
            <p>No {descriptor} {listTypeValues[type].title}</p>
        </div>
    )
}
