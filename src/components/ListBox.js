import React from 'react';

class ListBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            elements: [],
            itemList: props.itemList,
            previewLength: props.previewLength || 10,
            title: props.listTitle,
            showAll: false
        }
    }
    
    render() {
        let self = this
        this.state.elements = []
        const {elements,itemList} = this.state
        let arr = Array.from(itemList)
        
        for (const [idx,val] of arr.entries()) {
            const el = (
                <li key={val.identifier}>{ val.title }</li>
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

export default function ShowListBox(items, title, length) {
    if (!items || !items.length) return (<p>No items...</p>)
    else return (<ListBox itemList={items} listTitle={title} previewLength={length} />)
}

export {ListBox, ShowListBox}