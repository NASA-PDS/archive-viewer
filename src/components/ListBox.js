import React from 'react';

class ListBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            elements: [],
            itemList: props.itemList,
            previewLength: props.previewLength || 10,
            title: props.listTitle,
            query: props.query,
            showAll: false
        }
    }
    
    render() {
        let self = this
        this.state.elements = []
        const {elements,itemList,title} = this.state
        let arr = Array.from(itemList)
        
        if (!self.state.query) throw new Error('ListBox `query` is required.')
        
        for (const [idx,val] of arr.entries()) {
            const lid = val.identifier
            const link = `/?${self.state.query}=${lid}`
            
            const el = (
                <li key={val.identifier}><a href={link}>{ val.title }</a></li>
            )
            self.state.elements.push(el)
        } 
        
        function toggleList(e) {
            e.preventDefault();
            
            self.state.showAll = !self.state.showAll;
            self.setState({ showAll: self.state.showAll });
        }
        
        function commandText() {
            return (self.state.showAll) ? "Show Less" : "Show All";
        }
        
        function makeList(list) {
            return (self.state.showAll) ? list : list.slice(0,self.state.previewLength);
        }
        
        return (
            <div>
                <h3>{ title }</h3>
                <ul className="list-box">
                    { makeList(this.state.elements) }
                    <div className="button" onClick={toggleList}>{ commandText() } ({itemList.length})</div>
                </ul>
            </div>
        )
    }
}

export default function ShowListBox(items, type, length) {
    let title,
        element,
        query;
    
    switch (type) {
        case 'missions':
            title = 'Missions'
            query = 'mission'
            break;
        case 'datasets':
            title = 'Datasets'
            query = 'dataset'
            break;
        case 'instruments':
            title = 'Instruments'
            query = 'instrument'
            break;
        case 'targets':
            title = 'Targets'
            query = 'target'
            break;
        case 'spacecraft':
            title = 'Spacecraft'
            query = 'spacecraft'
            break;
        default:
            throw new Error(`Unexpected TYPE: ${type}`)
    }
    
    if (!items || !items.length) {
        return (
            <div>
                <h3>{title}</h3>
                <p>No items...</p>
            </div>
        )
    } else {
        return (<ListBox itemList={items} listTitle={title} query={query} previewLength={length} />)
    }
}

export {ListBox, ShowListBox}