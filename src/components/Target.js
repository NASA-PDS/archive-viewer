import React from 'react';
import {getSpacecraftForTarget, getDatasetsForTarget} from 'api/target.js'
import 'components/Target.scss';

export default class Target extends React.Component {
    constructor(props) {
        super(props)
        const target = props.target
        this.state = {
            target: target,
            loaded: false,
        }
    }

    render() {
        const {target} = this.state
        return (
            <div>
                <Header model={target} />
                <Main model={target} className="target-root" />
            </div>
        )
    }
}

class Header extends React.Component {
    constructor(props) {
        super(props)
        const target = props.model
        this.state = {
            target: target,
            loaded: false
        }
    }
    
    render() {
        const {display_name, title, image_url} = this.state.target
        const name = display_name ? display_name : title
        return (
            <header className="co-header target-header">
                <img src={image_url} />
                <h1 className="title"> { name } Data Archive </h1>
            </header>
        )
    }
}

class Main extends React.Component {
    constructor(props) {
        super(props)
        const target = props.model
        this.state = {
            target: target,
            loaded: false
        }
    }
    
    render() {
        const {target} = this.state
        return (
            <main className="co-main target-main">
                <Description model={target} />
                <DatasetList model={target} />
                <Aside model={target} />
            </main>
        )
    }
}

class Description extends React.Component {
    constructor(props) {
        super(props)
        const target = props.model
        this.state = {
            target: target,
            loaded: false
        }
    }
    
    render() {
        const {display_description, target_description} = this.state.target
        const description = display_description ? display_description : target_description
        
        return <p itemProp="description" className="resource-description">{ description }</p>
    }
}

class DatasetList extends React.Component {
    constructor(props) {
        super(props)
        const target = props.model
        this.state = {
            target: target,
            datasets: [],
            elements: [],
            loaded: false
        }
    }
    
    componentDidMount() {
        let self = this;
        getDatasetsForTarget(this.state.target).then(function(vals) {
            self.setState({
                datasets: vals
            })
        })
    }
    
    render() {
        let self = this
        const {datasets} = this.state
        let arr = Array.from(datasets);
        
        for (const [idx,val] of arr.entries()) {
            self.state.elements.push(<li key={val.title}>{ val.title }</li>)
        } 
        
        return (
            <section className="co-section target-datasets">
                <h2>Datasets</h2>
                <ListBox itemList={self.state.elements} />
            </section>
        )
    }
}

class Aside extends React.Component {
    constructor(props) {
        super(props)
        const target = props.model
        this.state = {
            target: target,
            loaded: false
        }
    }
    
    render() {
        const {target} = this.state
        
        return (
            <aside className="co-aside target-aside">
                <SpacecraftList model={target} />
            </aside>
        )
    }
}

class SpacecraftList extends React.Component {
    constructor(props) {
        super(props)
        const target = props.model
        this.state = {
            target: target,
            spacecraft: [],
            elements: [],
            loaded: false
        }
    }
    
    componentDidMount() {
        let self = this;
        getSpacecraftForTarget(this.state.target).then(function(vals) {
            self.setState({
                spacecraft: vals
            })
        })
    }
    
    render() {
        let self = this
        const {spacecraft} = self.state
        let arr = Array.from(spacecraft)
        
        for (const [idx,val] of arr.entries()) {
            const el = <li key={val.title}>{ val.title }</li>;
            
            self.state.elements.push(el);
        };
        
        return (
            <section className="co-section target-spacecraft">
                <h2>Spacecraft</h2>
                <ListBox itemList={self.state.elements} />
            </section>
        )
    }
}

class ListBox extends React.Component {
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