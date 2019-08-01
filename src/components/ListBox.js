import React from 'react';

class ListBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            elements: [],
            itemList: props.itemList,
            previewLength: props.previewLength || 10,
            title: props.listTitle,
            type: props.listType,
            showAll: false
        }
    }
    
    render() {
        let self = this
        this.state.elements = []
        const {elements,itemList} = this.state
        let arr = Array.from(itemList)
        
        if (!self.state.type) throw new Error('ListBox `type` is required.')
        
        for (const [idx,val] of arr.entries()) {
            const lid = val.identifier
            const link = `/?${self.state.type}=${lid}`
            
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
                <h3>{ this.state.title }</h3>
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
        element;
    
    switch (type) {
        case 'missions':
            title = 'Missions'
            break;
        case 'datasets':
            title = 'Datasets'
            break;
        case 'instruments':
            title = 'Instruments'
            break;
        case 'targets':
            title = 'Targets'
            break;
        case 'spacecraft':
            title = 'Spacecraft'
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
        return (<ListBox itemList={items} listTitle={title} listType={type} previewLength={length} />)
    }
}

export {ListBox, ShowListBox}