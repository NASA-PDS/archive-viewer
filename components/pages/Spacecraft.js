import { Typography } from '@material-ui/core';
import { getFriendlyInstrumentsForSpacecraft, getFriendlySiblingSpacecraft, getInstrumentsForSpacecraft, getSiblingSpacecraft } from 'api/spacecraft.js';
import { InstrumentBrowseTable } from 'components/BrowseTable';
import { Menu } from 'components/ContextObjects';
import HTMLBox from 'components/HTMLBox';
import { SpacecraftListBox } from 'components/ListBox';
import Loading from 'components/Loading';
import { Metadata } from "components/Metadata";
import PDS3Results from 'components/PDS3Results';
import PrimaryLayout from 'components/PrimaryLayout';
import RelatedTools from 'components/RelatedTools';
import { SpacecraftTagList } from 'components/TagList';
import React, { useEffect, useState } from 'react';

export default function Spacecraft(props) {
    const {spacecraft, siblings} = props
    const [relatedSpacecraft, setRelatedSpacecraft] = useState(siblings)
    const [instruments, setInstruments] = useState(props.instruments)
    // const [datasets, setDatasets] = useState(null)
    
    
    // useEffect(() => {
    //     getDatasetsForSpacecraft(spacecraft).then(setDatasets, console.error)

    //     return function cleanup() {
    //         setDatasets(null)
    //     }
    // }, [lidvid])

    useEffect(() => {
        getFriendlyInstrumentsForSpacecraft(props.instruments, [spacecraft]).then(setInstruments, console.error)
        return function cleanup() {
            setInstruments(null)
        }
    }, [props.instruments])

    useEffect(() => {
        if(siblings && siblings.length > 1) {
            getFriendlySiblingSpacecraft(siblings).then(setRelatedSpacecraft, console.error)
        }
        return function cleanup() {
            setRelatedSpacecraft(null)
        }
    }, [siblings])

    return (
        <>
            <Menu/>
            <PrimaryLayout primary={   
                <>
                <Typography variant="h1" gutterBottom> { spacecraft.display_name ? spacecraft.display_name : spacecraft.title } </Typography>
                <SpacecraftTagList tags={spacecraft.tags} />
                <Metadata model={spacecraft} />
                {/* <Description model={spacecraft}/> */}
                
                <HTMLBox markup={spacecraft.html1} />
                <RelatedTools tools={spacecraft.tools}/>
                <InstrumentBrowseTable items={instruments} />
                {/* <DatasetListBox items={datasets} groupBy={groupType.instrument} groupInfo={instruments} /> */}
                <HTMLBox markup={spacecraft.html2} />
                </>
            } secondary = {
                <PDS3Results name={spacecraft.display_name ? spacecraft.display_name : spacecraft.title} hostId={spacecraft.pds3_instrument_host_id}/>
            } navigational = {
                siblings && siblings.length > 1 &&
                    <SpacecraftListBox items={relatedSpacecraft} active={spacecraft.identifier} hideHeader/>
            }/>
        </>
    )
}
