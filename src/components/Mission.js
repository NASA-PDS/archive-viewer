import React from 'react';
import 'css/ContextObjects.scss'
import {getSpacecraftForMission, getTargetsForMission} from 'api/mission.js'
import {Header, Description} from 'components/ContextObjects'
import {SpacecraftListBox,TargetListBox} from 'components/ListBox'
import Loading from 'components/Loading'

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
        else return (
            <div>
                <Header model={mission} type={Header.type.mission} />
                <main className="co-main mission-main">
                    <Description model={mission} type={Description.type.mission} />
                    <SpacecraftListBox items={spacecraft} />
                </main>
                <aside className="sidebox">
                    <TargetListBox items={targets} />
                </aside>
            </div>
        )
    }
}

