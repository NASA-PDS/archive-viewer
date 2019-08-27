import React from 'react';
import 'css/ContextObjects.scss'
import {getSpacecraftForInstrument, getDatasetsForInstrument, getRelatedInstrumentsForInstrument} from 'api/instrument.js'
import {Header, Description} from 'components/ContextObjects'
import {DatasetListBox, InstrumentListBox, SpacecraftListBox} from 'components/ListBox'
import Loading from 'components/Loading'
import HTMLBox from 'components/HTMLBox'

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
        getSpacecraftForInstrument(this.state.instrument).then(spacecraft => {
            this.setState({spacecraft})
            getRelatedInstrumentsForInstrument(this.state.instrument, spacecraft).then(instruments => this.setState({instruments}), er => console.log(er))
        }, er => console.log(er))
        getDatasetsForInstrument(this.state.instrument).then(datasets => this.setState({datasets}), er => console.log(er))
    }

    render() {
        const {instrument,datasets,spacecraft,instruments} = this.state
        if (!instrument ) return <Loading fullscreen={true} />
        else return (
            <div className="co-main">
                <Header model={instrument} type={Header.type.instrument}/>
                <aside className="main-aside sidebox">
                    <SpacecraftListBox items={spacecraft} />
                    <InstrumentListBox items={instruments} />
                </aside>
                <Description model={instrument} type={Description.type.instrument} />
                <HTMLBox markup={instrument.html1} />
                <DatasetListBox items={datasets} />
                <HTMLBox markup={instrument.html2} />
            </div>
        )
    }
}