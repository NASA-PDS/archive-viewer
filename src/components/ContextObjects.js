import React from 'react';

class Header extends React.Component {
    static type = {
        target: 'target',
        spacecraft: 'spacecraft',
        instrument: 'instrument',
        mission: 'mission',
        dataset: 'dataset'
    }

    constructor(props) {
        super(props)
        const target = props.model
        this.state = {
            model: props.model,
            type: props.type,
            loaded: false
        }
    }
    
    render() {
        const {display_name, title, image_url} = this.state.model
        const name = display_name ? display_name : title
        return (
            <header className={`co-header ${this.state.type}-header ${this.state.type === Header.type.spacecraft ? 'subheader' : ''}`}>
                <img src={image_url} />
                <h1 className="title"> { name } <span className="header-supplemental-text" >Data Archive</span> </h1>
            </header>
        )
    }
}

class Description extends React.Component {
    static type = {
        target: 'target_',
        spacecraft: 'instrument_host_',
        instrument: 'instrument_',
        mission: 'investigation_',
        dataset: ''
    }
    constructor(props) {
        super(props)
        this.state = {
            model: props.model,
            type: props.type,
            showFull: false,
            loaded: false
        }
    }
    
    render() {
        let self = this
        const {display_description} = self.state.model
        const description = display_description ? display_description : self.state.model[`${self.state.type}description`]
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
            
            return <p>{short}{seeMore()}</p>
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

export {Header,Description}