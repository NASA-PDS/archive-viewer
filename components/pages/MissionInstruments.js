import { List, Typography, ListItem, ListItemText } from '@mui/material';
import { filterInstrumentsForSpacecraft } from 'api/instrument';
import { getFriendlyInstrumentsForSpacecraft, getFriendlySpacecraft } from 'api/spacecraft.js';
import Breadcrumbs from 'components/Breadcrumbs';
import { InstrumentBrowseTable } from 'components/BrowseTable';
import LoadingWrapper from 'components/LoadingWrapper';
import PrimaryLayout from 'components/PrimaryLayout';
import React, { useEffect, useState } from 'react';

export default function MissionInstruments(props) {
    const { mission } = props
    const [spacecraft, setSpacecraft] = useState(props.spacecraft)
    const [instruments, setInstruments] = useState(props.instruments)
    const [activeSpacecraft, setActiveSpacecraft] = useState(null)
    
    useEffect(() => {
        if(!!props.instruments && !!props.spacecraft) getFriendlyInstrumentsForSpacecraft(props.instruments, props.spacecraft).then(setInstruments, console.error)
        return function cleanup() {
            setInstruments(null)
        }
    }, [props.instruments, props.spacecraft])

    useEffect(() => {
        if(!!props.spacecraft) getFriendlySpacecraft(props.spacecraft).then(friendlySpacecraft => {
            setSpacecraft(friendlySpacecraft)
            setActiveSpacecraft(friendlySpacecraft.length > 0 ? friendlySpacecraft[0] : null)
        }, console.error)
        return function cleanup() {
            setSpacecraft(null)
        }
    }, [props.spacecraft])


    return (
        <PrimaryLayout primary={
            <>
                <Breadcrumbs currentTitle="Instruments" home={mission}/>
                <LoadingWrapper model={activeSpacecraft}>
                    {activeSpacecraft && 
                    <>
                        <Typography variant="h1" gutterBottom>Instruments for {activeSpacecraft.display_name || activeSpacecraft.title}</Typography>
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