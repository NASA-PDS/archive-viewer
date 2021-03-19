import { Typography } from '@material-ui/core';
import { filterInstrumentsForSpacecraft } from 'api/instrument';
import { getFriendlyInstrumentsForSpacecraft, getFriendlySpacecraft } from 'api/spacecraft.js';
import { InstrumentBrowseTable } from 'components/BrowseTable';
import { Menu } from 'components/ContextObjects';
import Loading from 'components/Loading';
import PrimaryLayout from 'components/PrimaryLayout';
import React, { useEffect, useState } from 'react';

export default function MissionInstruments(props) {
    const [spacecraft, setSpacecraft] = useState(props.spacecraft)
    const [instruments, setInstruments] = useState(props.instruments)
    
    useEffect(() => {
        if(!!props.instruments && !!props.spacecraft) getFriendlyInstrumentsForSpacecraft(props.instruments, props.spacecraft).then(setInstruments, console.error)
        return function cleanup() {
            setInstruments(null)
        }
    }, [props.instruments, props.spacecraft])

    useEffect(() => {
        if(!!props.spacecraft) getFriendlySpacecraft(props.spacecraft).then(setSpacecraft, console.error)
        return function cleanup() {
            setSpacecraft(null)
        }
    }, [props.spacecraft])


    return (
        <>
            <Menu/>
            <PrimaryLayout primary={!!spacecraft ? spacecraft.map(sp => 
                <div key={sp.identifier}>
                    <Typography variant="h1" gutterBottom>Instruments for {sp.display_name || sp.title}</Typography>
                    <InstrumentBrowseTable items={filterInstrumentsForSpacecraft(instruments, sp)} />
                </div>
            ) : <Loading fullscreen/>
            }/>
        </>
    )
}