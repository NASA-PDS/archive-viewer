import React from 'react';

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