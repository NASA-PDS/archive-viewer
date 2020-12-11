import React, { useEffect, useState } from 'react';
import {getSpacecraftForInstrument, getDatasetsForInstrument, getRelatedInstrumentsForInstrument, getPrimaryBundleForInstrument} from 'api/instrument.js'
import {InstrumentHeader, InstrumentDescription, Menu} from 'components/ContextObjects'
import {DatasetListBox, InstrumentListBox, SpacecraftListBox} from 'components/ListBox'
import {InstrumentTagList} from 'components/TagList'
import { Metadata, MoreInformation, DeliveryInfo } from 'components/pages/Dataset.js'
import CollectionList from 'components/CollectionList.js'
import HTMLBox from 'components/HTMLBox'
import RelatedTools from 'components/RelatedTools'
import PDS3Results from 'components/PDS3Results'
import {instrumentSpacecraftRelationshipTypes} from 'api/relationships'
import PrimaryLayout from 'components/PrimaryLayout'
import { Typography } from '@material-ui/core';


export default function Instrument({instrument, lidvid}) {
    const [datasets, setDatasets] = useState(null)
    const [spacecraft, setSpacecraft] = useState(null)
    const [instruments, setInstruments] = useState(null)
    const [primaryBundle, setPrimaryBundle] = useState(null)

    useEffect(() => {
        getSpacecraftForInstrument(instrument).then(spacecraft => {
            setSpacecraft(spacecraft)
            getRelatedInstrumentsForInstrument(instrument, spacecraft).then(setInstruments, er => console.error(er))
        }, er => console.error(er))
        getDatasetsForInstrument(instrument).then(setDatasets, er => console.error(er))
        getPrimaryBundleForInstrument(instrument).then(setPrimaryBundle, er => console.error(er))
        
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
                <RelatedTools tools={primaryBundle && instrument.tools ? [...instrument.tools, ...primaryBundle.tools] : instrument.tools}/>
                { primaryBundle ? 
                    <DatasetSynopsis dataset={primaryBundle}/>
                    : <DatasetListBox items={datasets} />
                }
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

function DatasetSynopsis({dataset}) {
    return <>
        <Typography variant="h2" gutterBottom>{dataset.display_name || dataset.title}</Typography>
        <DeliveryInfo dataset={dataset} />
        <Metadata dataset={dataset} />
        <MoreInformation dataset={dataset} />
        <CollectionList dataset={dataset} />
    </>
}