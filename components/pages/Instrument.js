import { Button, Typography } from '@material-ui/core';
import { ExitToApp } from '@material-ui/icons';
import { getDatasetsForInstrument, getPrimaryBundleForInstrument } from 'api/instrument.js';
import { getFriendlyInstrumentsForSpacecraft } from 'api/spacecraft';
import { InstrumentBreadcrumbs } from 'components/Breadcrumbs';
import HTMLBox from 'components/HTMLBox';
import InternalLink from 'components/InternalLink';
import { Metadata } from "components/Metadata";
import PDS3Results from 'components/PDS3Results';
import PrimaryLayout from 'components/PrimaryLayout';
import RelatedTools from 'components/RelatedTools';
import { LabeledListItem } from 'components/SplitListItem';
import { TagTypes } from 'components/TagSearch.js';
import React, { useEffect, useState } from 'react';

export default function Instrument({mission, instrument, siblings, spacecraft, lidvid, pdsOnly}) {
    const [datasets, setDatasets] = useState(null)
    const [instruments, setInstruments] = useState(siblings)
    const [primaryBundle, setPrimaryBundle] = useState(null)

    useEffect(() => {
        getDatasetsForInstrument(instrument).then(setDatasets, console.error)
        getPrimaryBundleForInstrument(instrument).then(setPrimaryBundle, console.error)

        return function cleanup() {
            setDatasets(null)
            setPrimaryBundle(null)
        }
    }, [lidvid])

    useEffect(() => {
        if(!!siblings && !!spacecraft) getFriendlyInstrumentsForSpacecraft(siblings, spacecraft).then(setInstruments, console.error)

        return function cleanup() {
            setInstruments(null)
        }
    }, [siblings, spacecraft])

    const showPrimaryBundle = primaryBundle && !pdsOnly
    const showLabeledDatasets = datasets && datasets.some(dataset => !!dataset.relatedBy.label)
    const showDatasetList = !showPrimaryBundle && !showLabeledDatasets
    

    return (
        <PrimaryLayout primary={
                <>
                <InstrumentBreadcrumbs current={instrument} home={mission}/>
                <Typography variant="h1" gutterBottom> { instrument.display_name || instrument.title } </Typography>
                <HTMLBox markup={instrument.html1} />
                <Metadata model={instrument} tagType={TagTypes.instrument}/>
                <LabeledDatasetList datasets={showPrimaryBundle ? [primaryBundle] : datasets}/>
                <HTMLBox markup={instrument.html2} />
                </>
            } secondary = {
                <>
                    <PDS3Results name={instrument.display_name ? instrument.display_name : instrument.title} instrumentId={instrument.pds3_instrument_id} hostId={instrument.pds3_instrument_host_id}/>
                </>
            } />
    )
}

function LabeledDatasetList({datasets}) {
    if(!datasets) return null;

    return <>
        {datasets.map((dataset, index) => 
            <LabeledListItem key={dataset.identifier} label={index === 0 && "Data"} item={
                <BundleLink identifier={dataset.identifier} label={(dataset.relatedBy && dataset.relatedBy.label) || dataset.display_name || dataset.title}/>
            }/>
        )}
    </>
}

function BundleLink({identifier, label}) {
    return <InternalLink identifier={identifier} passHref>
            <Button color="primary" variant={"contained"} size={"large"} endIcon={<ExitToApp/>}>{label}</Button>
    </InternalLink>
}