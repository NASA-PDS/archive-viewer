import React from 'react';
import 'css/ContextObjects.scss'
import {getSpacecraftForMission, getTargetsForMission} from 'api/mission.js'
import {Header, Description} from 'components/ContextObjects'
import {SpacecraftListBox,TargetListBox} from 'components/ListBox'
import Loading from 'components/Loading'
import Spacecraft from 'components/Spacecraft'

export default class Mission extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            mission: props.mission,
            spacecraft: null,
            targets: null,
            loaded: false,
        }
    }

    componentDidMount() {
        getSpacecraftForMission(this.state.mission).then(spacecraft => this.setState({spacecraft}))
        getTargetsForMission(this.state.mission).then(targets => this.setState({targets}))
    }

    render() {
        const {mission,spacecraft,targets} = this.state
        if (!mission || spacecraft === null || targets === null) return <Loading />

        // if this mission only has one spacecraft, we should just show that spacecraft's page
        else if(spacecraft.length === 1) return <Spacecraft spacecraft={spacecraft[0]}></Spacecraft>

        // otherwise, show simple page with list of this mission's spacecraft
        else return (
            <div>
                <Header model={mission} type={Header.type.mission} />
                <main className="co-main mission-main">
                    <Description model={mission} type={Description.type.mission} />
                    <div>
                        <h2>View the mission's data for:</h2>
                        { spacecraft.map(ButtonForSpacecraft)}
                    </div>
                </main>
                <aside className="sidebox">
                    <TargetListBox items={targets} />
                </aside>
            </div>
        )
    }
}

function ButtonForSpacecraft(spacecraft) {
    return (
        <a key={spacecraft.identifier} className="mission-spacecraft-button" href={`?spacecraft=${spacecraft.identifier}`}>
            <img src={spacecraft.image_url}/>
            <span className="spacecraft-title">{spacecraft.display_name ? spacecraft.display_name : spacecraft.title}</span>
        </a>
    )
}