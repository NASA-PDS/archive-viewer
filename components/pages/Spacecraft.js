import { getDatasetsForSpacecraft, getInstrumentsForSpacecraft, getSiblingSpacecraft } from 'api/spacecraft.js';
import { InstrumentBrowseTable } from 'components/BrowseTable';
import { Menu } from 'components/ContextObjects';
import HTMLBox from 'components/HTMLBox';
import { DatasetListBox, groupType, SpacecraftListBox } from 'components/ListBox';
import PDS3Results from 'components/PDS3Results';
import PrimaryLayout from 'components/PrimaryLayout';
import RelatedTools from 'components/RelatedTools';
import { SpacecraftTagList } from 'components/TagList';
import React, { useEffect, useState } from 'react';
import Description from 'components/Description'
import Loading from 'components/Loading';

export default function Spacecraft(props) {
    const {spacecraft, lidvid, siblings} = props
    const [relatedSpacecraft, setRelatedSpacecraft] = useState(null)
    const [instruments, setInstruments] = useState(null)
    const [datasets, setDatasets] = useState(null)
    
    
    useEffect(() => {
        getDatasetsForSpacecraft(spacecraft).then(setDatasets, console.error)

        return function cleanup() {
            setDatasets(null)
        }
    }, [lidvid])

    useEffect(() => {
        getInstrumentsForSpacecraft(spacecraft, props.instruments).then(setInstruments, console.error)
        return function cleanup() {
            setInstruments(null)
        }
    }, [props.instruments])

    useEffect(() => {
        if(siblings && siblings.length > 1) {
            getSiblingSpacecraft(siblings).then(setRelatedSpacecraft, console.error)
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
                <SpacecraftTagList tags={spacecraft.tags} />
                <Description model={spacecraft}/>
                
                <HTMLBox markup={spacecraft.html1} />
                <RelatedTools tools={spacecraft.tools}/>
                <InstrumentBrowseTable items={instruments} />
                <DatasetListBox items={datasets} groupBy={groupType.instrument} groupInfo={instruments} />
                <HTMLBox markup={spacecraft.html2} />
                </>
            } secondary = {
                <PDS3Results name={spacecraft.display_name ? spacecraft.display_name : spacecraft.title} hostId={spacecraft.pds3_instrument_host_id}/>
            } navigational = {
                siblings && siblings.length > 1 && (relatedSpacecraft && relatedSpacecraft.length > 1 ? 
                    <SpacecraftListBox items={relatedSpacecraft} active={spacecraft.identifier} hideHeader/>
                    : <Loading/>)
            }/>
        </>
    )
}
