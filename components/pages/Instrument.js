import React, { useEffect, useState } from 'react';
import {getSpacecraftForInstrument, getDatasetsForInstrument, getRelatedInstrumentsForInstrument, getPrimaryBundleForInstrument, getMissionsForInstrument} from 'api/instrument.js'
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
import { Typography, Box } from '@material-ui/core';
import TangentAccordion from 'components/TangentAccordion';
import Loading from 'components/Loading';
import { getMissionsForSpacecraft } from 'api/spacecraft';

export default function Instrument({instrument, lidvid, pdsOnly}) {
    const [datasets, setDatasets] = useState(null)
    const [mission, setMission] = useState(null)
    const [instruments, setInstruments] = useState(null)
    const [primaryBundle, setPrimaryBundle] = useState(null)

    useEffect(() => {
        getSpacecraftForInstrument(instrument).then(spacecraft => {
            getRelatedInstrumentsForInstrument(instrument, spacecraft).then(setInstruments, er => console.error(er))
            if(!mission && !!spacecraft) {
                getMissionsForSpacecraft(spacecraft[0]).then(missions => setMission(missions && missions.length > 0 ? missions[0] : null), console.error)
            }
        }, er => console.error(er))
        getDatasetsForInstrument(instrument).then(setDatasets, er => console.error(er))
        getPrimaryBundleForInstrument(instrument).then(setPrimaryBundle, er => console.error(er))
        getMissionsForInstrument(instrument).then(missions => setMission(missions && missions.length > 0 ? missions[0] : null), console.error)

        return function cleanup() {
            setInstruments(null)
            setDatasets(null)
            setPrimaryBundle(null)
            setMission(null)
        }
    }, [lidvid])

    const showPrimaryBundle = primaryBundle && !pdsOnly
    const showLabeledDatasets = !showPrimaryBundle && datasets && datasets.some(dataset => !!dataset.relatedBy.label)
    const showDatasetList = !showPrimaryBundle && !showLabeledDatasets
    

    return (
        <>
            <Menu/>
            <PrimaryLayout header={
                <InstrumentHeader model={instrument} mission={mission}/>
            } primary={
                <>
                <InstrumentTagList tags={instrument.tags} />
                <InstrumentDescription model={instrument} />
                <HTMLBox markup={instrument.html1} />
                <RelatedTools tools={primaryBundle && instrument.tools ? [...instrument.tools, ...primaryBundle.tools] : instrument.tools}/>
                {showPrimaryBundle && <DatasetSynopsis dataset={primaryBundle}/>}
                {showDatasetList && <DatasetListBox items={datasets} />}
                <HTMLBox markup={instrument.html2} />
                </>
            } secondary = {
                <>
                    {showLabeledDatasets && <LabeledDatasetList datasets={datasets}/> }
                    <PDS3Results name={instrument.display_name ? instrument.display_name : instrument.title} instrumentId={instrument.pds3_instrument_id} hostId={instrument.pds3_instrument_host_id}/>
                </>
            } navigational = {
                <InstrumentListBox items={instruments} groupInfo={instrumentSpacecraftRelationshipTypes} active={instrument.identifier} hideHeader/>
            }/>
        </>
    )
}

function DatasetSynopsis({dataset}) {
    return <Box p={2}>
        <Typography variant="h2" gutterBottom>{dataset.display_name || dataset.title}</Typography>
        <DeliveryInfo dataset={dataset} />
        <Metadata dataset={dataset} />
        {/* <MoreInformation dataset={dataset} /> */}
        <CollectionList dataset={dataset} />
    </Box>
}

function LabeledDatasetList({datasets}) {
    if(!datasets) return null;
    return <>
        {datasets.map(dataset => {
            return <TangentAccordion key={dataset.identifier}title={dataset.relatedBy.label}><DatasetSynopsis dataset={dataset}/></TangentAccordion>
        })}
    </>
}