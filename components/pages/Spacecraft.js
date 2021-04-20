import { Typography } from '@material-ui/core';
import { getFriendlySpacecraft } from 'api/spacecraft.js';
import Breadcrumbs from 'components/Breadcrumbs';
import HTMLBox from 'components/HTMLBox';
import { SpacecraftGroupedList } from 'components/GroupedList';
import { Metadata } from "components/Metadata";
import PrimaryLayout from 'components/PrimaryLayout';
import { SpacecraftTagList } from 'components/TagList';
import React, { useEffect, useState } from 'react';

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
                <SpacecraftGroupedList items={relatedSpacecraft} active={spacecraft.identifier}/>
        }/>
    )
}