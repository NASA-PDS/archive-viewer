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
        getMissionsForSpacecraft(this.state.spacecraft).then(missions => this.setState({missions}))
        getDatasetsForSpacecraft(this.state.spacecraft).then(datasets => {
            console.log(datasets);
            this.setState({datasets})
        })
    }

    render() {
        const {spacecraft,missions,datasets,instruments,targets} = this.state
        
        if (!spacecraft || !datasets || !targets || !instruments || !missions) return <Loading />
        else return (
            <div>
                <Header model={spacecraft} />
                <main className="co-main target-main">
                    <div>
                        <Description model={spacecraft} />
                    </div>
                    <DatasetListBox items={datasets} groupBy="instrument" groupInfo={instruments} />
                    <TargetListBox items={targets} />
                    <InstrumentListBox items={instruments} />
                    <MissionListBox items={missions} />
                </main>
            </div>
        )
    }
}