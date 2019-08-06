import React from 'react';
import 'css/ContextObjects.scss'
import {getSpacecraftForInstrument, getDatasetsForInstrument, getRelatedInstrumentsForInstrument} from 'api/instrument.js'
import {getInstrumentsForSpacecraft} from 'api/spacecraft'
import {Header, Description} from 'components/ContextObjects'
import ListBox from 'components/ListBox'
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
        getSpacecraftForInstrument(this.state.instrument).then(spacecraft => {
            this.setState({spacecraft})
            getRelatedInstrumentsForInstrument(this.state.instrument, spacecraft).then(instruments => this.setState({instruments}))
        })
        getDatasetsForInstrument(this.state.instrument).then(datasets => this.setState({datasets}))
    }

    render() {
        const {instrument,datasets,spacecraft,instruments} = this.state
        if (!instrument || datasets === null || spacecraft === null || instruments === null) return <Loading />
        else return (
            <div className="co-main">
                <Header model={instrument} type={Header.type.instrument}/>
                <aside className="main-aside sidebox">
                    <ListBox type="spacecraft" items={spacecraft} />
                    <ListBox type="instrument" items={instruments} />
                </aside>
                <Description model={instrument} type={Description.type.instrument} />
                <ListBox type="dataset" items={datasets} />
            </div>
        )
    }
}