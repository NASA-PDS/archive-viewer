import React from 'react';
import 'css/ListBox.scss'
import LID from 'services/LogicalIdentifier'
import Loading from 'components/Loading.js'

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
        titleSingular: 'Dataset',
        query: 'dataset'
    },
    [listTypes.mission]: {
        title: 'Missions',
        titleSingular: 'Mission',
        query: 'mission',
        fieldName: 'investigation_ref'
    },
    [listTypes.target]: {
        title: 'Targets',
        titleSingular: 'Target',
        query: 'target',
        fieldName: 'target_ref'
    },
    [listTypes.relatedTarget]: {
        title: 'Related Targets',
        titleSingular: 'Related Target',
        query: 'target',
        fieldName: 'target_ref'
    },
    [listTypes.instrument]: {
        title: 'Instruments',
        titleSingular: 'Instrument',
        query: 'instrument',
        fieldName: 'instrument_ref'
    },
    [listTypes.spacecraft]: {
        title: 'Spacecraft',
        titleSingular: 'Spacecraft',
        query: 'spacecraft',
        fieldName: 'instrument_host_ref'
    }
}
const downplayGroupsThreshold = 100
const hiddenGroupsThreshold = 1000

/* ------ Main Export Classes ------ */

class ListBox extends React.Component {

    static groupType = listTypes

    constructor(props, type) {
        super(props)

        // Set minimum list length for displaying a list
        const min = 25
        this.state = {
            type,
            showAll: props.items ? props.items.length <= min : false
        }
    }

    itemCount = () => {
        return this.props.items.length
    }

    makeList = () => {
        const {items, groupBy, groupInfo} = this.props
        const {type} = this.state
        const query = listTypeValues[type].query
        const groupByField = groupBy ? listTypeValues[groupBy].fieldName : null
        return items.length === 1
        ? <ItemLink item={items[0]} query={query} single={true}/> 
        : <GroupedList groups={this.createGroupings(items, groupInfo, groupByField)} query={query} type={type}/>
    }

    createGroupings = groupByAttributedRelationship
    
    render() {
        const {items} = this.props
        const {type} = this.state

        if(!items) {
            return <Loading/>
        } else if(this.itemCount() === 0) {
            return <NoItems type={type}/>
        } else {
            const singular = items.length === 1
            return (
                <div className="list-box">
                    
                    <span className="title-box">
                        <h2 className="title">{ singular ? listTypeValues[type].titleSingular : listTypeValues[type].title }</h2>
                        { !singular && <h3 className="count">({ this.itemCount() })</h3> }
                    </span>
                    
                    {   
                        this.makeList()
                    }
                    
                </div>
            )
        } 
    }
}

class DatasetListBox extends ListBox {
    constructor(props) {
        super(props, listTypes.dataset)
    }

    createGroupings = groupByRelatedItems
}
class MissionListBox extends ListBox {
    constructor(props) {
        super(props, listTypes.mission)
    }
}
class TargetListBox extends ListBox {
    constructor(props) {
        super(props, listTypes.target)
    }
}
class RelatedTargetListBox extends ListBox {
    constructor(props) {
        super(props, listTypes.relatedTarget)
    }

    makeList = () => {
        const {items} = this.props
        return <RelatedTargetsListBox targets={items} />
    }
}
class InstrumentListBox extends ListBox {
    constructor(props) {
        super(props, listTypes.instrument)
    }
}
class SpacecraftListBox extends ListBox {
    constructor(props) {
        super(props, listTypes.spacecraft)
    }
}

export {DatasetListBox, MissionListBox, TargetListBox, RelatedTargetListBox, InstrumentListBox, SpacecraftListBox}

/* ------ Internal Logic ------ */

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
            if (!!relationship.order && relationship.order < downplayGroupsThreshold) {
                groups.push(new Group(relationship.name, [], relationship.order))
            }
        }
    }
    for (let item of items) {

        // if possible, group by relationships already in data
        const relationship = item.relatedBy
        if(!!relationship) { insert(item, relationship.name, relationship.order) }
        else { insert(item, 'Other', 999) }
        
    }
    return groups
}

const groupByRelatedItems = (items, relatedItems, field) => {
    let insert = (item, groupName, order) => {
        let existingGroup = groups.find(group => group.name === groupName)
        if (!!existingGroup) {existingGroup.items.push(item)}
        else groups.push(new Group(groupName, [item], order))
    }
    let groups = []
    for (let item of items) {
        if(!field || !item[field] || !item[field].length) {
            insert(item, 'Other', 999)
        }
        else {
            const lids = item[field]
            // an item might appear in many groups simultaneously. add it to each group it references
            lids.forEach(lidvid => {
                let host_name
                const lid = new LID(lidvid).lid
                const groupInfoSource = relatedItems ? relatedItems.find(a => a.identifier === lid) : null
                
                if (groupInfoSource) host_name = nameFinder(groupInfoSource)
                else host_name = lid
                
                insert(item, host_name)
            })
        }
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
            insert(item, 'Other', 999)
        }
        else {
            insert(item, item.tags[0])
        }
    }
    return groups
}


/* ------ Internal Components ------ */

function GroupedList({groups, query, type}) {
    if (groups.length === 1) {
        return <List items={groups[0].items} query={query} />
    }
    let sortedGroups = groups.sort((a, b) => a.order < b.order ? -1 : 1)
    return sortedGroups.filter(group => Number.isInteger(group.order) ? group.order < hiddenGroupsThreshold : true).map((group, index) => 
        <GroupBox group={group} type={type} query={query} minor={Number.isInteger(group.order) ? group.order >= downplayGroupsThreshold : false} key={group.name} />
    )
}

class GroupBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showGroup: !props.minor,
            showToggle: props.minor
        }
    }

    toggleList = event => {
        event.preventDefault();
        this.setState({ showGroup: !this.state.showGroup });
    }

    render() {
        let items = this.props.group.items, title = this.props.group.name
        let {showToggle, showGroup} = this.state

        if(!items.length) {
            return <NoItems type={this.props.type} descriptor={title} />
        }
        return (
            <div>
                {showToggle 
                    ?<div onClick={ this.toggleList } className="expandable">
                        <img src={ this.state.showGroup ? `images/collapse.svg` : `images/expand.svg` } className={ this.state.showGroup ? 'collapse' : 'expand' } />
                        <h3>{ title }</h3>
                    </div>
                    : <div><h3>{title}</h3></div>
                }
                
                {showGroup
                    ? <List items={items} query={this.props.query} />
                    : null}
            </div>
        )
    }
}

function List({items, query}) {    
    let sortedItems = items.sort((a, b) => {
        return nameFinder(a).localeCompare(nameFinder(b))
    })
    return (
        <ul className="list">
            {sortedItems.map((item,idx) => 
                <li key={item.identifier + idx}><ItemLink item={item} query={query} single={false}/></li>
            )}
        </ul>
    )
}

function ItemLink({item, query, single}) {
    let url = `?${query}=${item.identifier}`
    return (
        <a href={url} className={single ? 'single-item' : ''}>
            <span className="list-item-name">{ nameFinder(item) }</span>
            { item.tags && <span className="list-item-tag"> - { item.tags[0]}</span> }
        </a>
    )
}

function RelatedTargetsListBox({targets}) {
    let groups = groupByFirstTag(targets)

    return !groups.length 
        ? <NoItems type={listTypes.relatedTarget}/> 
        : <GroupedList groups={groups} query={listTypeValues[listTypes.target].query} type={listTypes.target}/>
}

function NoItems({type, descriptor}) {
    return (
        <div className="no-items">
            <p>No {descriptor} {listTypeValues[type].title}</p>
        </div>
    )
}