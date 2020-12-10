import React, { useEffect, useState } from 'react';
import {getMissionsForSpacecraft, getTargetsForSpacecraft, getInstrumentsForSpacecraft, getDatasetsForSpacecraft} from 'api/spacecraft.js'
import {TargetListBox, DatasetListBox, groupType} from 'components/ListBox'
import {InstrumentBrowseTable} from 'components/BrowseTable'
import {MissionHeader, SpacecraftHeader, MissionDescription, Menu, SpacecraftDescription} from 'components/ContextObjects'
import {SpacecraftTagList} from 'components/TagList'
import HTMLBox from 'components/HTMLBox'
import RelatedTools from 'components/RelatedTools'
import PDS3Results from 'components/PDS3Results'
import {targetSpacecraftRelationshipTypes} from 'api/relationships'
import PrimaryLayout from 'components/PrimaryLayout'
import { Button } from '@material-ui/core'
import InternalLink from 'components/InternalLink'
import Loading from 'components/Loading';

export default function Spacecraft({spacecraft, lidvid, pdsOnly}) {
    const [mission, setMission] = useState(null)
    const [targets, setTargets] = useState(null)
    const [instruments, setInstruments] = useState(null)
    const [datasets, setDatasets] = useState(null)

    useEffect(() => {
        getMissionsForSpacecraft(spacecraft).then(missions => setMission((missions && missions.length > 0) ? missions[0] : null), er => console.error(er))
        getTargetsForSpacecraft(spacecraft).then(setTargets, er => console.error(er))
        getInstrumentsForSpacecraft(spacecraft).then(setInstruments, er => console.error(er))
        getDatasetsForSpacecraft(spacecraft).then(setDatasets, er => console.error(er))

        return function cleanup() {
            setMission(null)
            setTargets(null)
            setInstruments(null)
            setDatasets(null)
        }
    }, [lidvid])

    if(!mission) { return <Loading fullscreen={true}/> }

    return (
        <div className="co-main">
            { pdsOnly ? <SpacecraftHeader model={spacecraft}/> : <MissionHeader model={mission} />
            /* this is intentionally a mission header on the spacecraft page, since that is likely more relevant */}

            <Menu/>
            <PrimaryLayout primary={   
                <>
                <SpacecraftTagList tags={spacecraft.tags} />
                { pdsOnly ? <SpacecraftDescription model={spacecraft}/> : <MissionDescription model={mission} />
                /* this is intentionally a mission description on the spacecraft page, since that is likely more relevant */}
                {mission.instrument_host_ref && mission.instrument_host_ref.length > 1 &&
                    <SpacecraftHeader model={spacecraft} />
                }
                <HTMLBox markup={spacecraft.html1} />
                <RelatedTools tools={spacecraft.tools}/>
                <InstrumentBrowseTable items={instruments} />
                <DatasetListBox items={datasets} groupBy={groupType.instrument} groupInfo={instruments} />
                <PDS3Results name={spacecraft.display_name ? spacecraft.display_name : spacecraft.title} hostId={spacecraft.pds3_instrument_host_id}/>
                <HTMLBox markup={spacecraft.html2} />
                </>
            } secondary = {
                <>
                {mission && mission.instrument_host_ref && mission.instrument_host_ref.length > 1 &&
                    <InternalLink identifier={mission.identifier}><Button color="primary" variant="contained" style={{width: "100%"}}>Visit Mission Page</Button></InternalLink>
                }
                <TargetListBox items={targets} groupInfo={targetSpacecraftRelationshipTypes}/>
                </>
            }/>
        </div>
    )
}