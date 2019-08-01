import React from 'react';
import {getSpacecraftForInstrument, getDatasetsForInstrument, getRelatedInstrumentsForInstrument} from 'api/instrument.js'
import {getInstrumentsForSpacecraft} from 'api/spacecraft'
import {Header, Description} from 'components/ContextObjects'
import ShowListBox from 'components/ListBox'

export default class Instrument extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            instrument: props.instrument,
            datasets: null,
            spacecraft: null,
            instruments: null,
            loaded: false,
        }
    }

    componentDidMount() {
        getSpacecraftForInstrument(this.state.instrument).then(spacecraft => this.setState({spacecraft}))
        getDatasetsForInstrument(this.state.instrument).then(datasets => this.setState({datasets}))
        getRelatedInstrumentsForInstrument(this.state.instrument).then(instruments => this.setState({instruments}))
    }

    render() {
        const {instrument,datasets,spacecraft,instruments} = this.state
        return (
            <div>
                <Header model={instrument} />
                <main className="co-main instrument-main">
                    <div>
                        <Description model={instrument} />
                    </div>
                    { ShowListBox( datasets, 'datasets' ) }
                    { ShowListBox( spacecraft, 'spacecraft' ) }
                    { ShowListBox( instruments, 'instruments') }
                </main>
            </div>
        )
    }
}