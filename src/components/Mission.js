import React from 'react';
import {getSpacecraftForMission, getTargetsForMission} from 'api/mission.js'

export default class Mission extends React.Component {
    constructor(props) {
        super(props)
        const mission = props.mission
        this.state = {
            mission: mission,
            loaded: false,
        }
    }

    componentDidMount() {
        getSpacecraftForMission(this.state.mission).then(spacecraft => {
            console.log(spacecraft)
        })
        getTargetsForMission(this.state.mission).then(targets => {
            console.log(targets)
        })
    }

    render() {
        const {mission} = this.state
        return (
            <div>
                <Header model={mission} />
                <Description model={mission} />

            </div>
        )
    }
}

function Header({model}) {
    const {display_name, title, image_url} = model
    const name = display_name ? display_name : title
    return (
        <div className="mission-header">
            <img src={image_url} />
            <h1> { name } Data Archive </h1>
        </div>
    )
}

function Description({model}) {
    const {display_description, investigation_description} = model
    const description = display_description ? display_description : investigation_description
    return <h3 itemProp="description" className="resource-description">{ description }</h3>
}
