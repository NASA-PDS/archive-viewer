import { Typography, Breadcrumbs } from '@material-ui/core';
import { getFriendlySpacecraft } from 'api/spacecraft.js';
import { Menu } from 'components/ContextObjects';
import HTMLBox from 'components/HTMLBox';
import { SpacecraftListBox } from 'components/ListBox';
import { Metadata } from "components/Metadata";
import PDS3Results from 'components/PDS3Results';
import PrimaryLayout from 'components/PrimaryLayout';
import RelatedTools from 'components/RelatedTools';
import { SpacecraftTagList } from 'components/TagList';
import React, { useEffect, useState } from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import InternalLink from 'components/InternalLink';

export default function Spacecraft(props) {
    const {spacecraft, siblings, mission} = props
    const [relatedSpacecraft, setRelatedSpacecraft] = useState(siblings)

    useEffect(() => {
        if(siblings && siblings.length > 1) {
            getFriendlySpacecraft(siblings).then(setRelatedSpacecraft, console.error)
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
                <SpacecraftBreadcrumbs mission={mission} primary={spacecraft} />
                <Typography variant="h1" gutterBottom> { spacecraft.display_name ? spacecraft.display_name : spacecraft.title } </Typography>
                <SpacecraftTagList tags={spacecraft.tags} />
                <Metadata model={spacecraft} />
                
                <HTMLBox markup={spacecraft.html1} />
                <RelatedTools tools={spacecraft.tools}/>
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


function SpacecraftBreadcrumbs({mission, primary}) {
    if(!mission) {
        return <Breadcrumbs><Skeleton variant="text"></Skeleton></Breadcrumbs>
    }
    return <Breadcrumbs>
        <InternalLink identifier={mission.identifier}>{mission.display_name || mission.title}</InternalLink>
        <Typography color="textPrimary" nowrap>{primary.display_name || primary.title}</Typography>
    </Breadcrumbs>
}
