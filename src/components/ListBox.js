import React from 'react';

export default class ListBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            list: props.itemList,
            previewLength: props.previewLength || 10,
            showAll: false
        }
    }
    
    render() {
        let self = this
        const itemList = self.state.list
        
        function toggleList(e) {
            e.preventDefault();
            
            self.showAll = !self.showAll;
            self.setState({ showAll: self.showAll });
        }
        
        function commandText() {
            return (self.showAll) ? "Show Less" : "Show All";
        }
        
        function makeList(list) {
            return (self.state.showAll) ? list : list.slice(0,self.state.previewLength);
        }
        
        return (
            <ul className="list-box">
                { makeList(itemList) }
                <div className="button" onClick={toggleList}>{ commandText() } ({itemList.length})</div>
            </ul>
        )
    }
}