import React from 'react';
import LID from 'services/LogicalIdentifier'

export default class ListBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            elements: [],
            groupedItems: props.groupedItems,
            previewLength: props.previewLength || 10,
            title: props.listTitle,
            listHeaders: null,
            query: props.query,
            showAll: false
        }
    }
    
    render() {
        let self = this
        
        const {elements,groupedItems,title} = this.state
        this.state.elements = []
        self.state.listHeaders = Object.keys(groupedItems)
        
        self.state.listHeaders.map((key,idx) => {
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
            query: 'datasets',
            loaded: false,
        }
    }
    
    render() {
        let self = this
        const {items,title,query,length,groupBy} = self.state
        if (!self.state.items || !self.state.items.length) {
            return (<NoItems title={title} />)
        } else {
            let groupedItems;
            if (groupBy) {
                // Spacecraft
                if (groupBy === "spacecraft") groupedItems = groupby(self.state.items, 'instrument_host_ref')
                // TODO Instrument
                // TODO Data Type
                return (<ListBox groupedItems={groupedItems} listTitle={title} query={query} previewLength={length} />)
            } else {
                groupedItems = groupby(self.state.items, null)
            }
            return (<ListBox groupedItems={groupedItems} listTitle={title} query={query} previewLength={length} />)
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
        
        return (!items || !items.length) ? (<NoItems title={title} />) : (<ListBox groupedItems={groupby(items,null)} listTitle={title} query={query} />)
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
        
        return (!items || !items.length) ? (<NoItems title={title} />) : (<ListBox groupedItems={groupby(items,null)} listTitle={title} query={query} />)
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
        
        return (!items || !items.length) ? (<NoItems title={title} />) : (<ListBox groupedItems={groupby(items,null)} listTitle={title} query={query} />)
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

const groupby = (arr, val) => {
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
                const lid = new LID(lidvid).lid
                if (!items[lid]) items[lid] = [item]
                else items[lid].push(item)
            })
        })
    }
    return items
}

export {ListBox, DatasetListBox, SpacecraftListBox, TargetListBox, InstrumentListBox}