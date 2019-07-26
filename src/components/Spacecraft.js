import React from 'react';
import {getMissionsForSpacecraft, getTargetsForSpacecraft, getInstrumentsForSpacecraft, getDatasetsForSpacecraft} from 'api/spacecraft.js'

export default class Spacecraft extends React.Component {
    constructor(props) {
        super(props)
        const spacecraft = props.spacecraft
        this.state = {
            spacecraft: spacecraft,
            loaded: false,
        }
    }

    componentDidMount() {
        getMissionsForSpacecraft(this.state.spacecraft).then(missions => {
            console.log(missions)
        })
        getTargetsForSpacecraft(this.state.spacecraft).then(targets => {
            console.log(targets)
        })
        getInstrumentsForSpacecraft(this.state.spacecraft).then(instruments => {
            console.log(instruments)
        })
        getDatasetsForSpacecraft(this.state.spacecraft).then(datasets => {
            console.log(datasets)
        })
    }

    render() {
        const {spacecraft} = this.state
        return (
            <div>
                <Header model={spacecraft} />
                <Description model={spacecraft} />

            </div>
        )
    }
}

function Header({model}) {
    const {display_name, title, image_url} = model
    const name = display_name ? display_name : title
    return (
        <div className="spacecraft-header">
            <img src={image_url} />
            <h1> { name } Data Archive </h1>
        </div>
    )
}

function Description({model}) {
    const {display_description, instrument_host_description} = model
    const description = display_description ? display_description : instrument_host_description
    return <h3 itemProp="description" className="resource-description">{ description }</h3>
}
