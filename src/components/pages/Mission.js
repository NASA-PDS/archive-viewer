import React from 'react';
import 'css/ContextObjects.scss'
import {getSpacecraftForMission} from 'api/mission.js'
import {Header, Description, Menu} from 'components/ContextObjects'
import Loading from 'components/Loading'
import Spacecraft from 'components/pages/Spacecraft'

export default class Mission extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            mission: props.mission,
            spacecraft: null,
            loaded: false,
        }
    }

    componentDidMount() {
        getSpacecraftForMission(this.state.mission).then(spacecraft => this.setState({spacecraft}), er => console.log(er))
    }

    render() {
        const {mission,spacecraft} = this.state
        if (!mission) return <Loading fullscreen={true} />

        // if this mission only has one spacecraft, we should just show that spacecraft's page
        else if(spacecraft && spacecraft.length === 1) return <Spacecraft spacecraft={spacecraft[0]}></Spacecraft>

        // otherwise, show simple page with list of this mission's spacecraft
        else return (
            <div className="co-main">
                <Header model={mission} type={Header.type.mission} />
                <Menu/>
                <div className="co-content">
                    <Description model={mission} type={Description.type.mission} />
                    {!!spacecraft ? 
                        (<div className="mission-spacecraft-list">
                            <h2>View the mission's data for:</h2>
                            { spacecraft.map(ButtonForSpacecraft)}
                        </div>)
                        : <Loading/>
                    }
                </div>
            </div>
        )
    }
}

function ButtonForSpacecraft(spacecraft) {
    return (
        <a key={spacecraft.identifier} className="mission-spacecraft-button" href={`?spacecraft=${spacecraft.identifier}`}>
            {spacecraft.image_url && <img alt={"Image of " + spacecraft.title} src={spacecraft.image_url}/> }
            <span className="spacecraft-title">{spacecraft.display_name ? spacecraft.display_name : spacecraft.title}</span>
        </a>
    )
}