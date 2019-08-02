import React from 'react';
import LID from 'services/LogicalIdentifier'

export default class ListBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            elements: [],
            groupedItems: props.groupedItems,
            title: props.listTitle,
            query: props.query,
            showAll: false
        }
    }
    
    render() {
        let self = this
        let listHeaders
        
        const {elements,groupedItems,title} = this.state
        this.state.elements = []
        listHeaders = Object.keys(groupedItems)
        
        const regA = /[^a-zA-Z]/g;
        const regN = /[^0-9]/g;
        
        function sortAlphaNum(a, b) {
            const aA = a.replace(regA, "");
            const bA = b.replace(regA, "");
            
            if (aA === bA) {
                const aN = parseInt(a.replace(regN, ""), 10);
                const bN = parseInt(b.replace(regN, ""), 10);
                return aN === bN ? 0 : aN > bN ? 1 : -1;
            } else {
                return aA > bA ? 1 : -1;
            }
        }
        
        listHeaders.sort(sortAlphaNum).map((key,idx) => {
            const items = groupedItems[key]
            // first, push header <li> to elements array
            self.state.elements.push(<li className="list-header" key={key}>{ key }</li>)
            
            // second, push <li> for each dataset in the key
            items.map(item => {
                const lid = item.identifier
                const link = `/?${self.state.query}=${lid}`
                
                self.state.elements.push(<li key={item.identifier + idx}><a href={link}>{ item.title }</a></li>)
            })
        })
        
        function toggleList(e) {
            e.preventDefault();
            
            self.state.showAll = !self.state.showAll;
            self.setState({ showAll: self.state.showAll });
        }
        
        function commandText() {
            return (self.state.showAll) ? "Show Less" : "Show All";
        }
        
        return (
            <div>
                <h3>{ title }</h3>
                <ul className="list-box">
                    { this.state.elements }
                </ul>
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
            groupBy: props.groupBy,
            groupInfo: props.groupInfo,
            query: 'datasets',
            loaded: false,
        }
    }
    
    render() {
        let self = this
        const {items,title,query,length,groupBy,groupInfo} = self.state
        if (!self.state.items || !self.state.items.length) {
            return (<NoItems title={title} />)
        } else {
            let groupedItems;
            
            if (groupBy) groupedItems = groupby(self.state.items, 'instrument_host_ref', groupInfo)
            else groupedItems = groupby(self.state.items, null, null)
            
            return (<ListBox groupedItems={groupedItems} listTitle={title} query={query} />)
        }
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

export {ListBox, DatasetListBox, SpacecraftListBox, TargetListBox, InstrumentListBox}