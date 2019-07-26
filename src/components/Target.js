import React from 'react';
import {getSpacecraftForTarget, getDatasetsForTarget} from 'api/target.js'

export default class Target extends React.Component {
    constructor(props) {
        super(props)
        const target = props.target
        this.state = {
            target: target,
            loaded: false,
        }
    }

    componentDidMount() {
        getSpacecraftForTarget(this.state.target).then(function(val) {
            console.log(val)
        })
        getDatasetsForTarget(this.state.target).then(function(val) {
            console.log(val)
        })
    }

    render() {
        const {target} = this.state
        return (
            <div>
                <Header model={target} />
                <Description model={target} />

            </div>
        )
    }
}

function Header({model}) {
    const {display_name, title, image_url} = model
    const name = display_name ? display_name : title
    return (
        <div className="target-header">
            <img src={image_url} />
            <h1> { name } Data Archive </h1>
        </div>
    )
}

function Description({model}) {
    const {display_description, target_description} = model
    const description = display_description ? display_description : target_description
    return <h3 itemProp="description" className="resource-description">{ description }</h3>
}
