import React, { useEffect, useState } from 'react';
import {getSpacecraftForInstrument, getDatasetsForInstrument, getRelatedInstrumentsForInstrument} from 'api/instrument.js'
import {InstrumentHeader, InstrumentDescription, Menu} from 'components/ContextObjects'
import {DatasetListBox, InstrumentListBox, SpacecraftListBox} from 'components/ListBox'
import {InstrumentTagList} from 'components/TagList'
import HTMLBox from 'components/HTMLBox'
import RelatedTools from 'components/RelatedTools'
import PDS3Results from 'components/PDS3Results'
import {instrumentSpacecraftRelationshipTypes} from 'api/relationships'
import PrimaryLayout from 'components/PrimaryLayout'


export default function Instrument({instrument, lidvid}) {
    const [datasets, setDatasets] = useState(null)
    const [spacecraft, setSpacecraft] = useState(null)
    const [instruments, setInstruments] = useState(null)

    useEffect(() => {
        getSpacecraftForInstrument(instrument).then(spacecraft => {
            setSpacecraft(spacecraft)
            getRelatedInstrumentsForInstrument(instrument, spacecraft).then(setInstruments, er => console.log(er))
        }, er => console.log(er))
        getDatasetsForInstrument(instrument).then(setDatasets, er => console.log(er))

        return function cleanup() {
            setInstruments(null)
            setDatasets(null)
            setSpacecraft(null)
        }
    }, [lidvid])

    return (
        <div className="co-main">
            <InstrumentHeader model={instrument} />
            <Menu/>
            <PrimaryLayout primary={
                <>
                <InstrumentTagList tags={instrument.tags} />
                <InstrumentDescription model={instrument} />
                <HTMLBox markup={instrument.html1} />
                <RelatedTools tools={instrument.tools}/>
                <DatasetListBox items={datasets} />
                <PDS3Results name={instrument.display_name ? instrument.display_name : instrument.title} instrumentId={instrument.pds3_instrument_id} hostId={instrument.pds3_instrument_host_id}/>
                <HTMLBox markup={instrument.html2} />
                </>
            } secondary = {
                <>
                <SpacecraftListBox items={spacecraft} groupInfo={instrumentSpacecraftRelationshipTypes}/>
                <InstrumentListBox items={instruments} groupInfo={instrumentSpacecraftRelationshipTypes} />
                </>
            }/>
        </div>
    )
}