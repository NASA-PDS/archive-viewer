import React from 'react';
import 'css/ListBox.scss'
import LID from 'services/LogicalIdentifier'
import Loading from 'components/Loading.js'

export class OptionalListBox extends React.Component {
    render() {
        if(!!this.props.items) {
            return React.createElement(ListBox, this.props, null)
        } else {
            return <Loading/>
        }
    }
}

export default class ListBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            type: props.type,
            groupBy: props.groupBy,
            types: {
                dataset: {
                    title: 'Datasets',
                    titleSingular: 'Dataset',
                    query: 'dataset'
                },
                mission: {
                    title: 'Missions',
                    titleSingular: 'Mission',
                    query: 'mission'
                },
                target: {
                    title: 'Targets',
                    titleSingular: 'Target',
                    query: 'target'
                },
                relatedTarget: {
                    title: 'Related Targets',
                    titleSingular: 'Related Target',
                    query: 'target'
                },
                instrument: {
                    title: 'Instruments',
                    titleSingular: 'Instrument',
                    query: 'instrument',
                    groupBy: 'instrument_ref'
                },
                spacecraft: {
                    title: 'Spacecraft',
                    titleSingular: 'Spacecraft',
                    query: 'spacecraft',
                    groupBy: 'instrument_host_ref'
                }
            }
        }
        // Set minimum list length for displaying a list
        const min = 25
        this.state.showAll = this.props.items.length <= min
    }
    
    render() {
        let self = this
        
        const {type,types,groupBy} = self.state
        const {items, groupInfo} = this.props
        const threshold = 5
        
        function makeGroupedList(groups) {
            const titles = Object.keys(groups)
            return titles.sort().map(title => (<GroupBox groupTitle={title} groupItems={groups[title]} query={types[type]['query']} showAll={titles.length < threshold} />))
        }
        
        function makeList(type) {
            if (type === 'relatedTarget') {
                return <RelatedTargetsListBox targets={items} />
            }
            else {
                if (!items.length) return <NoItems />
                else if (items.length === 1) return <SingleItem item={items[0]} query={types[type]['query']} />
                else return groupBy ? makeGroupedList(groupby(items,types[groupBy]['groupBy'],groupInfo)) : <ul className="list"><List items={items} query={types[type]['query']} /></ul>
            }
        }
        
        function itemCount() {
            let current = 0
            return (type === 'relatedTarget') ? Object.keys(items).reduce((next, key) => current += items[key].length, current) : items.length
        }
        
        return (
            <div className="list-box">
                
                <span className="title-box">
                    <h2 className="title">{ items && items.length === 1 ? types[type]['titleSingular'] : types[type]['title'] }</h2>
                    <h3 className="count">({ itemCount() })</h3>
                </span>
                
                { makeList(type) }
                
            </div>
        )
    }
}

function SingleItem({item, query}) {
    return (<a className="single-item" href={`?${query}=${item.identifier}`}>{item.display_name ? item.display_name : item.title}</a>)
}

function List({items, query}) {
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
    
    return (!Object.keys(newGroup).length) ? <NoItems /> : Object.keys(newGroup).map(title => (<GroupBox groupTitle={title} groupItems={newGroup[title]} query={'target'} showAll={true} />))
}

function NoItems() {
    return (
        <div>
            <p>No items...</p>
        </div>
    )
}

const groupby = (arr, val, groupInfo) => {
    /* Takes an array and a keyword to sort array on
        returns a grouped objects of lids and
        lists of associated datasets
    */
    let items = {}
    if (val === null || !groupInfo) {
        items['All'] = arr
    } else {
        arr.map(item => {
            const lids = item[val]
            if (lids && lids.length > 0) lids.map(lidvid => {
                let host_name
                const lid = new LID(lidvid).lid
                const el = groupInfo.find(a => a.identifier === lid)
                
                if (el) host_name = el['instrument_host_name']
                else host_name = lid
                
                if (!items[host_name]) items[host_name] = [item]
                else items[host_name].push(item)
            })
        })
    }
    return items
}