import { Typography } from '@material-ui/core';
import { targetMissionRelationshipTypes } from 'api/relationships';
import { getMissionstForTarget } from 'api/target';
import Breadcrumbs from 'components/Breadcrumbs';
import { Menu } from 'components/ContextHeaders';
import EmptyMessage from 'components/EmptyMessage';
import { MissionListBox } from 'components/ListBox';
import Loading from 'components/Loading';
import LoadingWrapper from 'components/LoadingWrapper';
import PrimaryLayout from 'components/PrimaryLayout';
import React, { useEffect, useState } from 'react';

export default function TargetMissions(props) {
    const { target } = props
    const [missions, setMissions] = useState(null)

    useEffect(() => {
        getMissionstForTarget(target).then(setMissions, er => console.error(er))

        return function cleanup() {
            setMissions(null)
        }
    }, [target])


    return (
        <>
            <Menu/>
            <PrimaryLayout primary={
                <>
                    <Breadcrumbs currentTitle="Missions" home={target}/>
                    <Typography variant="h1" gutterBottom>Observational Missions</Typography>
                    <LoadingWrapper model={missions}>
                        <MissionListBox items={missions} groupInfo={targetMissionRelationshipTypes} hideHeader/>
                    </LoadingWrapper>
                    
                </>
            }/>
        </>
    )
}