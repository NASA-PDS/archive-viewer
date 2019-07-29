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
                
                <main className="co-main target-main">
                    <Description model={target} />
                </main>
                
                <Aside target={target} />
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
        const target = props.target
        this.state = {
            target: target,
            loaded: false
        }
    }
    
    render() {
        const {target} = this.state
        return (
            <main>
                <h2>I'm that main thang!</h2>
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

class Aside extends React.Component {
    constructor(props) {
        super(props)
        const target = props.target
        this.state = {
            target: target,
            loaded: false
        }
    }
    
    componentDidMount() {
        const that = this;
        getSpacecraftForTarget(this.state.target).then(function(val) {
            console.log('SPACECRAFT: ',val)
        })
        getDatasetsForTarget(this.state.target).then(function(val) {
            console.log('DATASETS: ',val)
        })
    }
    
    render() {
        const {target} = this.state
         return (
            <aside>
                <h2>THIS IS A TEST</h2>
            </aside>
        )
    }
}