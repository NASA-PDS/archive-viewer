import React from 'react';
import 'css/ListBox.scss'
import LID from 'services/LogicalIdentifier'

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
                    query: 'instrument'
                },
                spacecraft: {
                    title: 'Spacecraft',
                    titleSingular: 'Spacecraft',
                    query: 'spacecraft'
                }
            }
        }
        // Set minimum list length for displaying a list
        const min = 8
        this.state.showAll = this.state.items.length <= min
    }
    
    render() {
        let self = this
        
        const {items,type,types} = self.state
        
        function makeGroupedList(groups) {
            const titles = Object.keys(groups)
            return titles.sort().map(title => (<GroupBox groupTitle={title} groupItems={groups[title]} query={types[type]['query']} showAll={self.state.showAll} />))
        }
        
        function makeList(type) {
            if (type === 'relatedTarget') {
                return <RelatedTargetsListBox targets={items} />
            }
            else {
                if (!items.length) return <NoItems />
                else if (items.length === 1) return <SingleItem item={items[0]} query={types[type]['query']} />
                else return makeGroupedList(groupby(items,null,null))
            }
        }
        
        return (<div className="list-box">
            <h3 className="title">{ items && items.length === 1 ? types[type]['titleSingular'] : types[type]['title'] }</h3>
            { makeList(type) }
        </div>)
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
        return (<a href={`/?${this.state.query}=${this.state.item.identifier}`}>{this.state.item.display_name}</a>)
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
            return items.map((item,idx) => <li key={item.identifier + idx}><a href={`?${self.state.query}=${item.identifier}`}>{ item.title }</a></li>)
        }
        
        return (
            <div>
                <div onClick={ toggleList } className="expandable">
                    <img src={ self.state.showGroup ? `images/collapse.svg` : `images/expand.svg` } className={ self.state.showGroup ? 'collapse' : 'expand' } />
                    { self.state.title }
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
    if (val === null) {
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