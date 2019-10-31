import React from 'react';
import { Helmet } from 'react-helmet'

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
        const model = props.model
        this.state = {
            model: props.model,
            type: props.type,
            loaded: false
        }
    }
    
    render() {
        let self = this
        const {model,type} = self.state
        const {display_name, title, image_url} = this.state.model
        const name = display_name ? display_name : title
        const pageTitle = name + ' - PDS Archive Viewer'
        return (
            <header className={`co-header ${this.state.type}-header ${this.state.type === Header.type.spacecraft ? 'subheader' : ''}`}>
                <Helmet>
                    <title>{ pageTitle }</title>
                    <meta charSet="utf-8" />
                </Helmet>
                <img src={image_url} />
                <h1 className="title"> { name } <span className="header-supplemental-text" >Data Archive</span> </h1>
            </header>
        )
    }
}

const ridiculousLength = 10000
const previewLength = 750

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
        const descriptionProbablyReasonable = props.model.display_description && props.model.display_description.length < ridiculousLength
        this.state = {
            model: props.model,
            type: props.type,
            alwaysShow: descriptionProbablyReasonable,
            showFull: descriptionProbablyReasonable,
            loaded: false
        }
    }
    
    render() {
        let self = this
        const {display_description} = self.state.model
        const description = display_description ? display_description : self.state.model[`${self.state.type}description`]
        
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
            
            return <p>{full}{self.state.alwaysShow ? null : seeLess()}</p>
        }
        
        return <div itemProp="description" className="resource-description">
            { !description ? <p>No description is available.</p> : self.state.showFull ? full(description) : shorten(description) }
        </div>
    }
}

export {Header,Description}