import { Typography } from '@material-ui/core';
import { getFriendlySpacecraft } from 'api/spacecraft.js';
import { Menu } from 'components/ContextHeaders';
import HTMLBox from 'components/HTMLBox';
import { SpacecraftListBox } from 'components/ListBox';
import { Metadata } from "components/Metadata";
import PDS3Results from 'components/PDS3Results';
import PrimaryLayout from 'components/PrimaryLayout';
import RelatedTools from 'components/RelatedTools';
import { SpacecraftTagList } from 'components/TagList';
import React, { useEffect, useState } from 'react';
import Breadcrumbs from 'components/Breadcrumbs'

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
        <PrimaryLayout primary={   
            <>
            <Breadcrumbs current={spacecraft} home={mission}/>
            <Typography variant="h1" gutterBottom> { spacecraft.display_name ? spacecraft.display_name : spacecraft.title } </Typography>
            <SpacecraftTagList tags={spacecraft.tags} />
            <HTMLBox markup={spacecraft.html1} />
            <Metadata model={spacecraft} />
            <HTMLBox markup={spacecraft.html2} />
            </>
        } navigational = {
            siblings && siblings.length > 1 &&
                <SpacecraftListBox items={relatedSpacecraft} active={spacecraft.identifier} hideHeader/>
        }/>
    )
}