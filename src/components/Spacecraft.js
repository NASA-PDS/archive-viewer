import React from 'react';
import 'css/ContextObjects.scss'
import {getMissionsForSpacecraft, getTargetsForSpacecraft, getInstrumentsForSpacecraft, getDatasetsForSpacecraft} from 'api/spacecraft.js'
import {getSpacecraftForTarget} from 'api/target'
import ListBox from 'components/ListBox'
import {Header, Description} from 'components/ContextObjects'
import Loading from 'components/Loading'

export default class Spacecraft extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            spacecraft: props.spacecraft,
            mission: null,
            missions: null,
            instruments: null,
            targets: null,
            datasets: null,
            loaded: false,
        }
    }

    componentDidMount() {
        getTargetsForSpacecraft(this.state.spacecraft).then(targets => this.setState({targets}))
        getInstrumentsForSpacecraft(this.state.spacecraft).then(instruments => this.setState({instruments}))
        getMissionsForSpacecraft(this.state.spacecraft).then(missions => this.setState({missions: missions,mission: missions && missions.length > 0 ? missions[0] : null}))
        getDatasetsForSpacecraft(this.state.spacecraft).then(datasets => this.setState({datasets}))
    }

    render() {
        const {spacecraft,mission,missions,datasets,instruments,targets} = this.state
        if (!spacecraft || datasets === null || targets === null || instruments === null || mission === null || missions === null) return <Loading />
        else {
            return (
                <div>
                    <Header model={mission} type={Header.type.mission} />
                    <main className="co-main target-main">
                        <div><Description model={mission} type={Description.type.mission} /></div>
                        <Header model={spacecraft} type={Header.type.spacecraft}/>
                        <ListBox type="dataset" items={datasets} groupBy="instrument" groupInfo={instruments} />
                    </main>
                    <aside className="sidebox">
                        <ListBox type="mission"    items={missions} />
                        <ListBox type="target"     items={targets} />
                        <ListBox type="instrument" items={instruments} />
                    </aside>
                </div>
            )
        }
    }
}
