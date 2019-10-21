import React from 'react';
import 'css/ListBox.scss'
import LID from 'services/LogicalIdentifier'
import Loading from 'components/Loading.js'

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
const groupTypesToIgnore = ['Ignore', 'Error']

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
        : <GroupedList items={items} query={query} groupByField={groupByField} groupInfo={groupInfo}/>
    }
    
    render() {
        const {items} = this.props
        const {type} = this.state

        if(!items) {
            return <Loading/>
        } else if(!items.length) {
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

    itemCount = () => {
        let current = 0, items = this.props.items
        return Object.keys(items).reduce((next, key) => current += items[key].length, current)
    }

    makeList = () => {
        const {items} = this.props

        return <RelatedTargetsListBox targets={items} />
    }

    render() { return null}
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

function GroupedList({items, query, groupByField, groupInfo}) {
    const groups = groupItems(items,groupByField,groupInfo)

    if (groups.length === 1) {
        return <List items={items} query={query} />
    }
    const threshold = 3
    return groups.filter(group => !groupTypesToIgnore.includes(group.name)).map((group, index) => 
        <GroupBox groupTitle={group.name} groupItems={group.items} query={query} showAll={index < threshold} key={group.name} />
    )
}

class Group {
    constructor(name, items, order) {
        this.name = name
        this.items = items
        this.order = order ? order : name
    }
}

const groupItems = (items, field, groupInfo) => {
    /* Takes an array and a keyword to sort array on
        returns a grouped objects of lids and
        lists of associated datasets
    */
    let groups = []

    let insert = (item, groupName, order) => {
        let existingGroup = groups.find(group => group.name === groupName)
        if (!!existingGroup) {existingGroup.items.push(item)}
        else groups.push(new Group(groupName, [item], order))
    }
    for (let item of items) {

        // if possible, group by relationships already in data
        const relationship = item.relatedBy
        if(!!relationship) {
            insert(item, relationship.name, relationship.order)
        }

        // otherwise, group by the field specified, or all together
        else if(!field || !item[field] || !item[field].length) {
            insert(item, 'Other', 99999)
        }
        else {
            const lids = item[field]
            // an item might appear in many groups simultaneously. add it to each group it references
            lids.forEach(lidvid => {
                let host_name
                const lid = new LID(lidvid).lid
                const groupInfoSource = groupInfo ? groupInfo.find(a => a.identifier === lid) : null
                
                if (groupInfoSource) host_name = groupInfoSource.display_name ? groupInfoSource.display_name : groupInfoSource.title
                else host_name = lid
                
                insert(item, host_name)
            })
        }
    }
    groups = groups.sort((a, b) => a.order < b.order ? -1 : 1)
    
    return groups
}

class GroupBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showGroup: props.showAll
        }
    }

    toggleList = event => {
        event.preventDefault();
        this.setState({ showGroup: !this.state.showGroup });
    }

    render() {
        let items = this.props.groupItems, title = this.props.groupTitle

        return (
            <div>
                <div onClick={ this.toggleList } className="expandable">
                    <img src={ this.state.showGroup ? `images/collapse.svg` : `images/expand.svg` } className={ this.state.showGroup ? 'collapse' : 'expand' } />
                    <h3>{ title }</h3>
                </div>
                {this.state.showGroup
                    ? <List items={items} query={this.props.query} />
                    : null}
            </div>
        )
    }
}

function List({items, query}) {    
    return (
        <ul className="list">
            {items.map((item,idx) => 
                <li key={item.identifier + idx}><ItemLink item={item} query={query} single={false}/></li>
            )}
        </ul>
    )
}

function ItemLink({item, query, single}) {
    return (
        <a href={`?${query}=${item.identifier}`} className={single ? 'single-item' : ''}>
            <span className="list-item-name">{ item.display_name ? item.display_name : item.title }</span>
        </a>
    )
}

function RelatedTargetsListBox({targets}) {
    let newGroup = {}
    
    if (targets.parents && targets.parents.length) newGroup['Parents'] = targets.parents
    if (targets.children && targets.children.length) newGroup['Children'] = targets.children
    if (targets.associated && targets.associated.length) newGroup['Associated'] = targets.associated
    
    return (!Object.keys(newGroup).length) ? <NoItems /> : Object.keys(newGroup).map(title => (<GroupBox groupTitle={title} groupItems={newGroup[title]} query={listTypeValues[listTypes.relatedTarget].query} showAll={true} />))
}

function NoItems({type}) {
    return (
        <div className="no-items">
            <p>No {listTypeValues[type].title}</p>
        </div>
    )
}