import React from 'react';
import LID from 'services/LogicalIdentifier'

class ListBox extends React.Component {
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
        
        self.state.listHeaders.map(key => {
            const items = groupedItems[key]
            // first, push header <li> to elements array
            self.state.elements.push(<li className="list-header">{ key }</li>)
            
            // second, push <li> for each dataset in the key
            items.map(item => {
                const lid = item.identifier
                const link = `/?${self.state.query}=${lid}`
                
                self.state.elements.push(<li key={item.identifier}><a href={link}>{ item.title }</a></li>)
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
                    <div className="button" onClick={toggleList}>{ commandText() } ({ self.state.listHeaders.length })</div>
                </ul>
            </div>
        )
    }
}

export default function ShowDatasetListBox(items, length) {
    const title = 'Datasets'
    const query = 'dataset'
    let element;
    
    if (!items || !items.length) {
        return (
            <div>
                <h3>{title}</h3>
                <p>No items...</p>
            </div>
        )
    } else {
        /* * * * * GROUP BY: * * * * */
        // Spacecraft
        let groupedItems = {}
        items.map(item => {
            const lids = item['instrument_host_ref']
            if (lids && lids.length > 0) lids.map(lidvid => {
                const lid = new LID(lidvid).lid
                if (!groupedItems[lid]) groupedItems[lid] = [item]
                else groupedItems[lid].push(item)
            })
        })
        // Instrument
        
        // Data Type
        return (<ListBox groupedItems={groupedItems} listTitle={title} query={query} previewLength={length} />)
    }
}

export {ListBox, ShowDatasetListBox}