import React from 'react';

export default class HTMLBox extends React.Component {
    createMarkup() {
        return {__html: this.props.markup}
    }
    render() {
        if(!!this.props.markup) {
            return <div dangerouslySetInnerHTML={this.createMarkup()} />
        }
        return null
    }
}