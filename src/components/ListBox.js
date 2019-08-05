import React from 'react';
import 'css/ListBox.scss'
import LID from 'services/LogicalIdentifier'

export default class ListBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            elements: [],
            groupedItems: props.groupedItems,
            title: props.listTitle,
            showAll: props.showAll || false,
            query: props.query
        }
    }
    
    render() {
        let self = this
        
        const {groupedItems,title} = this.state
        this.state.elements = []
        
        function makeGroupedList(groups) {
            const titles = Object.keys(groups)
            
            return titles.sort().map(title => {
                return (
                    <div>
                        <GroupBox groupTitle={title} groupItems={groups[title]} query={self.state.query} showAll={self.state.showAll} />
                    </div>
                )
            })
        }
        
        return (
            <div className="list-box">
                <h3 className="title">{ title }</h3>
                { makeGroupedList(self.state.groupedItems) }
            </div>
        )
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

class DatasetListBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            items: props.items,
            title: 'Datasets',
            groups: { // constant list of mappings
                spacecraft: 'instrument_host_ref',
                instrument: 'instrument_ref'
            },
            groupBy: props.groupBy || null,
            groupInfo: props.groupInfo || null,
            query: 'dataset',
        }
    }
    
    render() {
        let self = this
        const {items,title,query,length,groupBy,groupInfo,groups} = self.state
        const keyword = groups[groupBy]
        
        return (<ListBox groupedItems={groupby(self.state.items, keyword, groupInfo)} listTitle={title} query={query} />)
    }
}

class SpacecraftListBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            items: props.items,
            title: 'Spacecraft',
            query: 'spacecraft',
            loaded: false,
        }
    }
    
    render() {
        let self = this
        const {items,title,query} = self.state
        
        return (!items || !items.length) ? (<NoItems title={title} />) : (<ListBox groupedItems={groupby(items,null,null)} listTitle={title} query={query} />)
    }
}

class TargetListBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            items: props.items,
            title: 'Targets',
            query: 'target',
            loaded: false,
        }
    }
    
    render() {
        let self = this
        const {items,title,query} = self.state
        
        return (!items || !items.length) ? (<NoItems title={title} />) : (<ListBox groupedItems={groupby(items,null,null)} listTitle={title} query={query} />)
    }
}

class InstrumentListBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            items: props.items,
            title: 'Instruments',
            query: 'instrument',
            loaded: false
        }
    }
    
    render() {
        let self = this
        const {items,title,query} = self.state
        
        return (!items || !items.length) ? (<NoItems title={title} />) : (<ListBox groupedItems={groupby(items,null,null)} listTitle={title} query={query} />)
    }
}

class MissionListBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            items: props.items,
            title: 'Missions',
            query: 'mission',
            loaded: false
        }
    }
    
    render() {
        let self = this
        const {items,title,query} = self.state
        
        return (!items || !items.length) ? (<NoItems title={title} />) : (<ListBox groupedItems={groupby(items,null,null)} listTitle={title} query={query} />)
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
                <h3>{this.state.title}</h3>
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

export {ListBox, DatasetListBox, SpacecraftListBox, TargetListBox, InstrumentListBox, MissionListBox}