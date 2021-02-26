import { getSpacecraftForMission } from 'api/mission.js';
import { getDatasetsForSpacecraft, getInstrumentsForSpacecraft, getMissionsForSpacecraft } from 'api/spacecraft.js';
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

export default function Spacecraft({spacecraft, lidvid, pdsOnly}) {
    const [relatedSpacecraft, setRelatedSpacecraft] = useState(null)
    const [instruments, setInstruments] = useState(null)
    const [datasets, setDatasets] = useState(null)
    
    
    useEffect(() => {
        const handleMissions = (missions) => {
            if(missions && missions.length > 0) {
                const primaryMission = missions[0]
                getSpacecraftForMission(primaryMission).then(setRelatedSpacecraft, console.error)
            }
        }
        getMissionsForSpacecraft(spacecraft).then(handleMissions, er => console.error(er))
        getInstrumentsForSpacecraft(spacecraft).then(setInstruments, er => console.error(er))
        getDatasetsForSpacecraft(spacecraft).then(setDatasets, er => console.error(er))

        return function cleanup() {
            setInstruments(null)
            setDatasets(null)
            setRelatedSpacecraft(null)
        }
    }, [lidvid])

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
                relatedSpacecraft && relatedSpacecraft.length > 1 && <SpacecraftListBox items={relatedSpacecraft} active={spacecraft.identifier} hideHeader/>
            }/>
        </>
    )
}
