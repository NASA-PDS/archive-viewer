import React from 'react';
import 'css/ListBox.scss'
import LID from 'services/LogicalIdentifier'
import Loading from 'components/Loading.js'

export class OptionalListBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            items: props.items,
        }
    }
    render() {
        console.log(`rendering for ${this.props.type} ${this.props.items}`)
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
            items: props.items,
            type: props.type,
            groupBy: props.groupBy,
            groupInfo: props.groupInfo,
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
        this.state.showAll = this.state.items.length <= min
    }
    
    render() {
        let self = this
        
        const {items,type,types,groupBy,groupInfo} = self.state
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

class SingleItem extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            item: props.item,
            query: props.query
        }
    }
    
    render() {
        let {item} = this.state
        return (<a className="single-item" href={`?${this.state.query}=${item.identifier}`}>{item.display_name ? item.display_name : item.title}</a>)
    }
}

class List extends React.Component {
    constructor(props) {
        super(props)
        this.state = { items: props.items, query: props.query }
    }
    
    render() {
        return this.state.items.map((item,idx) => <li key={item.identifier + idx}><a href={`?${this.state.query}=${item.identifier}`}>{ item.display_name ? item.display_name : item.title }</a></li>)
    }
}

class GroupBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            items: props.groupItems,
            title: props.groupTitle,
            query: props.query,
            showGroup: props.showAll
        }
    }
    
    render() {
        let self = this
        
        function toggleList(e) {
            e.preventDefault();
            
            self.state.showGroup = !self.state.showGroup;
            self.setState({ showGroup: self.state.showGroup });
        }
        
        function listItems(items) {
            return items.map((item,idx) => <li key={item.identifier + idx}><a href={`?${self.state.query}=${item.identifier}`}><span className="list-item-name">{ item.display_name ? item.display_name : item.title }</span></a></li>)
        }
        
        return (
            <div>
                <div onClick={ toggleList } className="expandable">
                    <img src={ self.state.showGroup ? `images/collapse.svg` : `images/expand.svg` } className={ self.state.showGroup ? 'collapse' : 'expand' } />
                    <h3>{ self.state.title }</h3>
                </div>
                {self.state.showGroup
                    ? <ul className="list">{ listItems(this.state.items) }</ul>
                    : null}
            </div>
        )
    }
}

class RelatedTargetsListBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            targets: props.targets
        }
    }
    
    render() {
        const self = this
        const {targets} = self.state
        
        let newGroup = {}
        
        if (targets.parents && targets.parents.length) newGroup['Parents'] = targets.parents
        if (targets.children && targets.children.length) newGroup['Children'] = targets.children
        if (targets.associated && targets.associated.length) newGroup['Associated'] = targets.associated
        
        return (!Object.keys(newGroup).length) ? <NoItems /> : Object.keys(newGroup).map(title => (<GroupBox groupTitle={title} groupItems={newGroup[title]} query={'target'} showAll={true} />))
    }
}

class NoItems extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            title: props.title
        }
    }
    render() {
        return (
            <div>
                <p>No items...</p>
            </div>
        )
    }
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