import React from 'react';
import {getSpacecraftForMission, getTargetsForMission} from 'api/mission.js'
import {Header, Description} from 'components/ContextObjects'

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