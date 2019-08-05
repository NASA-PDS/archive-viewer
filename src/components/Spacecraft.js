import React from 'react';
import 'css/ContextObjects.scss'
import {getMissionsForSpacecraft, getTargetsForSpacecraft, getInstrumentsForSpacecraft, getDatasetsForSpacecraft} from 'api/spacecraft.js'
import {getSpacecraftForTarget} from 'api/target'
import {DatasetListBox, TargetListBox, InstrumentListBox, MissionListBox} from 'components/ListBox'
import {Header, Description} from 'components/ContextObjects'
import Loading from 'components/Loading'

export default class Spacecraft extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            spacecraft: props.spacecraft,
            mission: null,
            instruments: null,
            targets: null,
            datasets: null,
            loaded: false,
        }
    }

    componentDidMount() {
        getTargetsForSpacecraft(this.state.spacecraft).then(targets => this.setState({targets}))
        getInstrumentsForSpacecraft(this.state.spacecraft).then(instruments => this.setState({instruments}))
        getMissionsForSpacecraft(this.state.spacecraft).then(missions => this.setState({mission: missions && missions.length > 0 ? missions[0] : null}))
        getDatasetsForSpacecraft(this.state.spacecraft).then(datasets => this.setState({datasets}))
    }

    render() {
        const {spacecraft,mission,datasets,instruments,targets} = this.state
        if (!spacecraft || !datasets || !targets || !instruments || !mission) return <Loading />
        else return (
            <div>
                <Header model={mission} type={Header.type.mission} />
                <main className="co-main target-main">
                    <div><Description model={mission} type={Description.type.mission} /></div>
                    <Header model={spacecraft} type={Header.type.spacecraft}/>
                    <DatasetListBox items={datasets} groupBy="instrument" groupInfo={instruments} />
                    <TargetListBox items={targets} />
                    <InstrumentListBox items={instruments} />
                </main>
            </div>
        )
    }
}