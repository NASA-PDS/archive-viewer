import React from 'react';
import {getSpacecraftForInstrument, getDatasetsForInstrument, getRelatedInstrumentsForInstrument} from 'api/instrument.js'
import {getInstrumentsForSpacecraft} from 'api/spacecraft'
import {Header, Description} from 'components/ContextObjects'
import ListBox from 'components/ListBox'

export default class Instrument extends React.Component {
    constructor(props) {
        super(props)
        const instrument = props.instrument
        this.state = {
            instrument: instrument,
            loaded: false,
        }
    }

    componentDidMount() {
        getSpacecraftForInstrument(this.state.instrument).then(spacecraft => {
            console.log(spacecraft)
            getRelatedInstrumentsForInstrument(this.state.instrument, spacecraft).then(console.log)
        })
        getDatasetsForInstrument(this.state.instrument).then(console.log)
    }

    render() {
        const {instrument} = this.state
        return (
            <div>
                <Header model={instrument} />
                <Description model={instrument} />

            </div>
        )
    }
}

class InstrumentList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            instruments: props.instruments,
            elements: [],
            loaded: false
        }
    }
    
    render() {
        let self = this
        const {instruments} = self.state
        self.state.elements = [];
        let arr = Array.from(instruments)
        
        for (const [idx,val] of arr.entries()) {
            const lid = val.identifier
            const link = `/?instrument=${lid}`
            
            self.state.elements.push(<li key={val.title}><a href={link}>{val.title}</a></li>)
        }
        
        return (
            <section className="co-section instrument-list">
                <h2>Instruments</h2>
                <ListBox itemList={self.state.elements} />
            </section>
        )
    }
}

export {Instrument, InstrumentList}