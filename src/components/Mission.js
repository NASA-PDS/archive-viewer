import React from 'react';
import {getSpacecraftForMission, getTargetsForMission} from 'api/mission.js'
import {Header, Description} from 'components/ContextObjects'
import ShowListBox from 'components/ListBox'

export default class Mission extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            mission: props.mission,
            datasets: null,
            spacecraft: null,
            instruments: null,
            targets: null,
            loaded: false,
        }
    }

    componentDidMount() {
        getSpacecraftForMission(this.state.mission).then(spacecraft => this.setState({spacecraft}))
        getTargetsForMission(this.state.mission).then(targets => this.setState({targets}))
    }

    render() {
        const {mission,datasets,spacecraft,instruments,targets} = this.state
        
        return (
            <div>
                <Header model={mission} />
                <Description model={mission} />
                <main className="co-main mission-main">
                    { ShowListBox( spacecraft, 'spacecraft') }
                    { ShowListBox( targets, 'targets') }
                </main>
            </div>
        )
    }
}