import React from 'react';
import {getMissionsForSpacecraft, getTargetsForSpacecraft, getInstrumentsForSpacecraft, getDatasetsForSpacecraft} from 'api/spacecraft.js'
import {getSpacecraftForTarget} from 'api/target'
import ListBox from 'components/ListBox'
import {DatasetList} from 'components/Dataset'
import {MissionList} from 'components/Mission'
import {InstrumentList} from 'components/Instrument'
import {TargetList} from 'components/Target'
import {Header, Description} from 'components/ContextObjects'

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
        getTargetsForSpacecraft(this.state.spacecraft).then(targets => {
            this.setState({targets})
        })
        getInstrumentsForSpacecraft(this.state.spacecraft).then(instruments => {
            this.setState({instruments})
        })
        getMissionsForSpacecraft(this.state.spacecraft).then(missions => {
            this.setState({missions})
        })
        getDatasetsForSpacecraft(this.state.spacecraft).then(datasets => {
            this.setState({datasets})
        })
    }

    render() {
        const {spacecraft,missions,datasets,instruments,targets} = this.state
        
        const showMissionList = mission => (!missions) ? <p>Loading...</p> : <MissionList missions={missions} />;
        const showDatasetList = dataset => (!datasets) ? <p>Loading...</p> : <DatasetList datasets={datasets} />;
        const showInstrumentList = instrument => (!instruments) ? <p>Loading...</p> : <InstrumentList instruments={instruments} />;
        const showTargetList = target => (!targets) ? <p>Loading...</p> : <TargetList targets={targets} />;
        
        return (
            <div>
                <Header model={spacecraft} />
                <Description model={spacecraft} />
                <main className="co-main target-main">
                    {showMissionList(missions)}
                    {showDatasetList(datasets)}
                    {showInstrumentList(instruments)}
                    {showTargetList(targets)}
                </main>
            </div>
        )
    }
}

class SpacecraftList extends React.Component {
    constructor(props) {
        super(props)
        const target = props.model
        this.state = {
            target: target,
            spacecraft: [],
            elements: [],
            loaded: false
        }
    }
    
    componentDidMount() {
        let self = this;
        getSpacecraftForTarget(this.state.target).then(function(vals) {
            self.setState({
                spacecraft: vals
            })
        })
    }
    
    render() {
        let self = this
        const {spacecraft} = self.state
        let arr = Array.from(spacecraft)
        
        for (const [idx,val] of arr.entries()) {
            const lid = val.identifier
            const link = `/?spacecraft=${lid}`
            
            self.state.elements.push(<li key={val.title}><a href={link}>{ val.title }</a></li>);
        };
        
        return (
            <section className="co-section target-spacecraft">
                <h2>Spacecraft</h2>
                <ListBox itemList={self.state.elements} />
            </section>
        )
    }
}

export {Spacecraft,SpacecraftList}