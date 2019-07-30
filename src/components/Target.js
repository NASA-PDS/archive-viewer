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
        const {datasets} = this.state
        let arr = Array.from(datasets);
        let elements = [];
        for (const [idx,val] of arr.entries()) {
            elements.push(<li key={val.title}>{ val.title }</li>)
        } 
        
        return (
            <section className="co-section target-datasets">
                <h2>Datasets</h2>
                <ul className="list-box">
                    { elements }
                </ul>
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
        const {spacecraft} = this.state
        let arr = Array.from(spacecraft)
        
        let elements = [];
        for (const [idx,val] of arr.entries()) {
            elements.push(<li key={val.title}>{ val.title }</li>)
        }
        
        return (
            <section className="co-section target-spacecraft">
                <h2>Spacecraft</h2>
                <ul className="list-box">
                    { elements }
                </ul>
            </section>
        )
    }
}