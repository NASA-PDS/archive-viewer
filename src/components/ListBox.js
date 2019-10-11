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
        query: 'mission'
    },
    [listTypes.target]: {
        title: 'Targets',
        titleSingular: 'Target',
        query: 'target'
    },
    [listTypes.relatedTarget]: {
        title: 'Related Targets',
        titleSingular: 'Related Target',
        query: 'target'
    },
    [listTypes.instrument]: {
        title: 'Instruments',
        titleSingular: 'Instrument',
        query: 'instrument',
        groupBy: 'instrument_ref'
    },
    [listTypes.spacecraft]: {
        title: 'Spacecraft',
        titleSingular: 'Spacecraft',
        query: 'spacecraft',
        groupBy: 'instrument_host_ref'
    }
}

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

    makeGroupedList = (groups) => {
        const titles = Object.keys(groups)
        const threshold = 5
        return titles.sort().map(title => (<GroupBox groupTitle={title} groupItems={groups[title]} query={listTypeValues[this.state.type].query} showAll={titles.length < threshold} key={title} />))
    }

    makeList = (type) => {
        const {items, groupInfo, groupBy} = this.props

        if (!items.length) return <NoItems />
        else if (items.length === 1) return <SingleItem item={items[0]} query={listTypeValues[type].query} />
        else return groupBy ? this.groupby(items,listTypeValues[groupBy].groupBy,groupInfo) : <ul className="list"><List items={items} query={listTypeValues[type].query} /></ul>
    }

    groupby = (arr, val, groupInfo) => {
        const {type} = this.state
        /* Takes an array and a keyword to sort array on
            returns a grouped objects of lids and
            lists of associated datasets
        */
        let items = {}
        if (val === null || !groupInfo) {
            items['All'] = arr
        } else {
            for (let i = 0; i < arr.length; i++) {
                const item = arr[i]
                const lids = item[val]
                if (!lids || !lids.length) {
                    return <ul className="list"><List items={arr} query={listTypeValues[type].query} /></ul>
                } else if (lids && lids.length > 0) lids.map(lidvid => {
                    let host_name
                    const lid = new LID(lidvid).lid
                    const el = groupInfo.find(a => a.identifier === lid)
                    
                    if (el) host_name = el.display_name ? el.display_name : el.title
                    else host_name = lid
                    
                    if (!items[host_name]) items[host_name] = [item]
                    else items[host_name].push(item)
                })
            }
        }
        return this.makeGroupedList(items)
    }
    
    render() {
        
        const {items} = this.props
        const {type} = this.state
        
        if(!!this.props.items) {
            return (
                <div className="list-box">
                    
                    <span className="title-box">
                        <h2 className="title">{ items && items.length === 1 ? listTypeValues[type].titleSingular : listTypeValues[type].title }</h2>
                        <h3 className="count">({ this.itemCount() })</h3>
                    </span>
                    
                    { this.makeList(type) }
                    
                </div>
            )
        } else {
            return <Loading/>
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

    makeList = (type) => {
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



function SingleItem({item, query}) {
    return (<a className="single-item" href={`?${query}=${item.identifier}`}>{item.display_name ? item.display_name : item.title}</a>)
}

function List({items, query}) {
    console.log(items);
    return items.map((item,idx) => <li key={item.identifier + idx}><a href={`?${query}=${item.identifier}`}>{ item.display_name ? item.display_name : item.title }</a></li>)
}

class GroupBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showGroup: props.showAll
        }
    }
    
    listItems(items) {
        return items.map((item,idx) => <li key={item.identifier + idx}><a href={`?${this.props.query}=${item.identifier}`}><span className="list-item-name">{ item.display_name ? item.display_name : item.title }</span></a></li>)
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
                    ? <ul className="list">{ this.listItems(items) }</ul>
                    : null}
            </div>
        )
    }
}

function RelatedTargetsListBox({targets}) {
    let newGroup = {}
    
    if (targets.parents && targets.parents.length) newGroup['Parents'] = targets.parents
    if (targets.children && targets.children.length) newGroup['Children'] = targets.children
    if (targets.associated && targets.associated.length) newGroup['Associated'] = targets.associated
    
    return (!Object.keys(newGroup).length) ? <NoItems /> : Object.keys(newGroup).map(title => (<GroupBox groupTitle={title} groupItems={newGroup[title]} query={listTypeValues[listTypes.relatedTarget].query} showAll={true} />))
}

function NoItems() {
    return (
        <div>
            <p>No items...</p>
        </div>
    )
}