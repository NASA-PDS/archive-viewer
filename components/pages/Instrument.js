import { Box, Breadcrumbs, Typography, Button } from '@material-ui/core';
import { filterInstrumentsForSpacecraft, getDatasetsForInstrument, getPrimaryBundleForInstrument, getRelatedInstrumentsForInstrument, getSiblingInstruments, getSpacecraftForInstrument } from 'api/instrument.js';
import { getFriendlyInstrumentsForSpacecraft } from 'api/spacecraft'
import { instrumentSpacecraftRelationshipTypes } from 'api/relationships';
import CollectionList from 'components/CollectionList.js';
import { Menu } from 'components/ContextHeaders';
import HTMLBox from 'components/HTMLBox';
import { DatasetListBox, InstrumentListBox } from 'components/ListBox';
import { DeliveryInfo } from 'components/pages/Dataset.js';
import { Metadata } from "components/Metadata";
import PDS3Results from 'components/PDS3Results';
import PrimaryLayout from 'components/PrimaryLayout';
import RelatedTools from 'components/RelatedTools';
import { InstrumentTagList } from 'components/TagList';
import TangentAccordion from 'components/TangentAccordion';
import React, { useEffect, useState } from 'react';
import Description from 'components/Description'
import Loading from 'components/Loading';
import InternalLink from 'components/InternalLink';
import Skeleton from '@material-ui/lab/Skeleton';
import { LabeledListItem } from 'components/SplitListItem';
import { ExitToApp } from '@material-ui/icons';
import {InstrumentBreadcrumbs} from 'components/Breadcrumbs'

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
        <>
            <Menu/>
            <PrimaryLayout primary={
                <>
                <InstrumentBreadcrumbs current={instrument} home={mission}/>
                <Typography variant="h1" gutterBottom> { instrument.display_name || instrument.title } </Typography>
                <InstrumentTagList tags={instrument.tags} />
                <Metadata model={instrument} />
                <LabeledDatasetList datasets={showPrimaryBundle ? [primaryBundle] : datasets}/>
                <HTMLBox markup={instrument.html1} />
                <RelatedTools tools={primaryBundle && instrument.tools ? [...instrument.tools, ...primaryBundle.tools] : instrument.tools}/>
                <HTMLBox markup={instrument.html2} />
                </>
            } secondary = {
                <>
                    <PDS3Results name={instrument.display_name ? instrument.display_name : instrument.title} instrumentId={instrument.pds3_instrument_id} hostId={instrument.pds3_instrument_host_id}/>
                </>
            } navigational = {!!spacecraft ? spacecraft.map(sp => 
                <Box key={sp.identifier} py={2}>
                    { spacecraft.length > 1 && <Box px={2} >
                        <Typography variant="h3" gutterBottom>{sp.display_name || sp.title}</Typography>
                    </Box> }
                    <InstrumentListBox items={filterInstrumentsForSpacecraft(instruments, sp)} groupInfo={instrumentSpacecraftRelationshipTypes} active={instrument.identifier} hideHeader/>
                </Box>
            ) : <Loading/>
            }/>
        </>
    )
}

function LabeledDatasetList({datasets}) {
    console.log(datasets)
    if(!datasets) return null;

    return <>
        {datasets.map(dataset => 
            <LabeledListItem key={dataset.identifier} label="Data" item={
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