import React from 'react';

export default class Instrument extends React.Component {
    constructor(props) {
        super(props)
        const instrument = props.instrument
        this.state = {
            instrument: instrument,
            loaded: false,
        }
    }

    componentDidMount() {
    }

    render() {
        const {instrument} = this.state
        return (
            <div>
                <Header model={instrument} />
                <Description model={instrument} />

            </div>
        )
    }
}

function Header({model}) {
    const {display_name, title, image_url} = model
    const name = display_name ? display_name : title
    return (
        <div className="instrument-header">
            <img src={image_url} />
            <h1> { name } Data Archive </h1>
        </div>
    )
}

function Description({model}) {
    const {display_description, instrument_description} = model
    const description = display_description ? display_description : instrument_description
    return <h3 itemProp="description" className="resource-description">{ description }</h3>
}
