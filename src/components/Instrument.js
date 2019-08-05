import React from 'react';
import 'css/ContextObjects.scss'
import {getSpacecraftForInstrument, getDatasetsForInstrument, getRelatedInstrumentsForInstrument} from 'api/instrument.js'
import {getInstrumentsForSpacecraft} from 'api/spacecraft'
import {Header, Description} from 'components/ContextObjects'
import {DatasetListBox,SpacecraftListBox,InstrumentListBox} from 'components/ListBox'
import Loading from 'components/Loading'

export default class Instrument extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            instrument: props.instrument,
            datasets: null,
            spacecraft: null,
            instruments: null, // related instruments
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
        if (!instrument || !datasets || !spacecraft || !instruments) return <Loading />
        else return (
            <div>
                <Header model={instrument} />
                <main className="co-main instrument-main">
                    <div>
                        <Description model={instrument} />
                    </div>
                    <DatasetListBox items={datasets} />
                    <SpacecraftListBox items={spacecraft} />
                    <InstrumentListBox items={instruments} />
                </main>
            </div>
        )
    }
}