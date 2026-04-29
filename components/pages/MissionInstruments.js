import { List, Typography, ListItem, ListItemText } from '@mui/material';
import { filterInstrumentsForSpacecraft } from 'api/instrument';
import Breadcrumbs from 'components/Breadcrumbs';
import { InstrumentBrowseTable } from 'components/BrowseTable';
import LoadingWrapper from 'components/LoadingWrapper';
import PrimaryLayout from 'components/PrimaryLayout';
import React, { useEffect, useState } from 'react';
import { getFriendlyInstrumentsForSpacecraft, getFriendlySpacecraft } from 'api/spacecraft';
import { logPrefetchFallback } from 'services/prefetchFallbackLog';

export default function MissionInstruments(props) {
    const { mission } = props
    const [spacecraft, setSpacecraft] = useState(props.prefetchedFriendlySpacecraft || props.spacecraft)
    const [instruments, setInstruments] = useState(props.prefetchedFriendlyInstruments || props.instruments)
    const [activeSpacecraft, setActiveSpacecraft] = useState((props.prefetchedFriendlySpacecraft || props.spacecraft || [])[0] || null)
    
    useEffect(() => {
        if(props.prefetchedFriendlyInstruments) {
            setInstruments(props.prefetchedFriendlyInstruments)
            return
        }
        if(!!props.instruments && !!props.spacecraft) {
            logPrefetchFallback('MissionInstruments:getFriendlyInstrumentsForSpacecraft', { identifier: mission?.identifier || null })
            getFriendlyInstrumentsForSpacecraft(props.instruments, props.spacecraft).then(setInstruments, () => setInstruments(props.instruments))
        }
        return function cleanup() {
            setInstruments(null)
        }
    }, [props.instruments, props.spacecraft, props.prefetchedFriendlyInstruments, mission])

    useEffect(() => {
        if(props.prefetchedFriendlySpacecraft) {
            setSpacecraft(props.prefetchedFriendlySpacecraft)
            setActiveSpacecraft(props.prefetchedFriendlySpacecraft.length > 0 ? props.prefetchedFriendlySpacecraft[0] : null)
            return
        }
        if(!!props.spacecraft) {
            logPrefetchFallback('MissionInstruments:getFriendlySpacecraft', { identifier: mission?.identifier || null })
            getFriendlySpacecraft(props.spacecraft).then(friendly => {
                setSpacecraft(friendly)
                setActiveSpacecraft(friendly.length > 0 ? friendly[0] : null)
            }, () => {
                setSpacecraft(props.spacecraft)
                setActiveSpacecraft(props.spacecraft.length > 0 ? props.spacecraft[0] : null)
            })
        }
        return function cleanup() {
            setSpacecraft(null)
        }
    }, [props.spacecraft, props.prefetchedFriendlySpacecraft, mission])


    return (
        <PrimaryLayout primary={
            <>
                <Breadcrumbs currentTitle="Instrument Data" home={mission}/>
                <LoadingWrapper model={activeSpacecraft}>
                    {activeSpacecraft && 
                    <>
                        <Typography variant="h1">Instrument Data for {activeSpacecraft.display_name || activeSpacecraft.title}</Typography>
                        <Typography variant="subtitle1" >Observational data from the mission instruments</Typography>
                        <InstrumentBrowseTable items={filterInstrumentsForSpacecraft(instruments, activeSpacecraft)} />
                    </>
                    }
                </LoadingWrapper>
            </>
        } navigational = {
            spacecraft && spacecraft.length > 1 &&
            <List>
                {spacecraft.map(sp => 
                    <ListItem key={sp.identifier} component="a" button onClick={() => setActiveSpacecraft(sp)} selected={sp.identifier === activeSpacecraft?.identifier}>
                        <ListItemText primary={sp.display_name || sp.title} primaryTypographyProps={{color: "primary"}}/>
                    </ListItem>    
                )}
            </List>
        }/>
    )
}
