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
                <Main model={target} />
                <Aside model={target} />
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
            <div className="co-header target-header">
                <img src={image_url} />
                <h1> { name } Data Archive </h1>
            </div>
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
                <Datasets model={target} />
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
        
        return <h3 itemProp="description" className="resource-description">{ description }</h3>
    }
}

class Datasets extends React.Component {
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
            elements.push(<li>{ val.title }</li>)
        } 
        
        return (
            <section className="co-section target-datasets">
                <h4>Datasets</h4>
                { elements }
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
            <aside>
                <Spacecraft model={target} />
            </aside>
        )
    }
}

class Spacecraft extends React.Component {
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
            elements.push(<li>{ val.title }</li>)
        }
        
        return (
            <div className="co-section target-spacecraft">
                <h4>Spacecraft</h4>
                { elements }
            </div>
        )
    }
}