import { Typography } from '@material-ui/core';
import { getSpacecraftForTarget } from 'api/target';
import { SpacecraftBrowseTable } from 'components/BrowseTable';
import { Menu } from 'components/ContextHeaders';
import InternalLink from 'components/InternalLink';
import Loading from 'components/Loading';
import PrimaryLayout from 'components/PrimaryLayout';
import React, { useEffect, useState } from 'react';
import Breadcrumbs from 'components/Breadcrumbs'

export default function TargetMissions(props) {
    const { target } = props
    const [spacecraft, setSpacecraft] = useState(null)

    useEffect(() => {
        getSpacecraftForTarget(target).then(setSpacecraft, er => console.error(er))

        return function cleanup() {
            setSpacecraft(null)
        }
    }, [target])


    return (
        <>
            <Menu/>
            <PrimaryLayout primary={!!spacecraft ? 
                <>
                    <Breadcrumbs currentTitle="Missions" home={target}/>
                    <Typography variant="h1" gutterBottom>Observational Spacecraft</Typography>
                    <SpacecraftBrowseTable items={spacecraft} />
                    
                </>
                : <Loading/>
            }/>
        </>
    )
}