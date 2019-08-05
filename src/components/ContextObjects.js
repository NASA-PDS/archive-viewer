import React from 'react';

class Header extends React.Component {
    constructor(props) {
        super(props)
        const model = props.model
        this.state = {
            model: model,
            type: props.modelType,
            loaded: false
        }
    }
    
    render() {
        let self = this
        const {model,type} = self.state
        const {display_name, title, image_url} = model
        const name = display_name ? display_name : title
        return (
            <header className={ `co-header ${type}-header` }>
                <img src={image_url} />
                <h1 className="title"> { name } Data Archive </h1>
            </header>
        )
    }
}

class TargetHeader extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            target: props.target
        }
    }
    
    render() {
        let self = this
        const {target} = self.state
        
        return <Header model={target} modelType="target" />
    }
}

class SpacecraftHeader extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            spacecraft: props.spacecraft
        }
    }
    
    render() {
        let self = this
        const {spacecraft} = self.state
        
        return <Header model={spacecraft} modelType="spacecraft" />
    }
}

class MissionHeader extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            mission: props.mission
        }
    }
    
    render() {
        let self = this
        const {mission} = self.state
        
        return <Header model={mission} modelType="mission" />
    }
}

class InstrumentHeader extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            instrument: props.instrument
        }
    }
    
    render() {
        let self = this
        const {instrument} = self.state
        
        return <Header model={instrument} modelType="instrument" />
    }
}

class Description extends React.Component {
    constructor(props) {
        super(props)
        const target = props.model
        this.state = {
            target: target,
            showFull: false,
            loaded: false
        }
    }
    
    render() {
        let self = this
        
        const {display_description, target_description} = self.state.target
        const description = display_description ? display_description : target_description
        const previewLength = 750
        
        function expand(e) {
            e.preventDefault()
            
            self.state.showFull = !self.state.showFull
            self.setState({showFull:self.state.showFull})
        }
        
        function seeMore() {
            return <span className="link inline-link" onClick={ expand }>Show Description</span>
        }
        
        function seeLess() {
            return <span className="link inline-link" onClick={ expand }>Hide Description</span>
        }
        
        function shorten(description) {
            const short = description.split('').splice(0,previewLength).join('') + '... '
            
            return (description.length < previewLength) ? description : <p>{ short }{ seeMore() }</p>
        }
        
        function full(description) {
            const full = description
            
            return <p>{full}{seeLess()}</p>
        }
        
        return <div itemProp="description" className="resource-description">
            { !description ? <p>No description is available.</p> : self.state.showFull ? full(description) : shorten(description) }
        </div>
    }
}

export {Header,TargetHeader,SpacecraftHeader,MissionHeader,InstrumentHeader,Description}