import React from 'react';
import {getMissionsForSpacecraft, getTargetsForSpacecraft, getInstrumentsForSpacecraft, getDatasetsForSpacecraft} from 'api/spacecraft.js'
import {getSpacecraftForTarget} from 'api/target'
import ShowListBox from 'components/ListBox'
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
        
        return (
            <div>
                <Header model={spacecraft} />
                <Description model={spacecraft} />
                <main className="co-main target-main">
                    { ShowListBox( missions, 'missions' ) }
                    { ShowListBox( datasets, 'datasets' ) }
                    { ShowListBox( instruments, 'instruments' ) }
                    { ShowListBox( targets, 'targets' ) }
                </main>
            </div>
        )
    }
}