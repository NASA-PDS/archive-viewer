import { Typography } from '@mui/material';
import Breadcrumbs from 'components/Breadcrumbs';
import { SpacecraftGroupedList } from 'components/GroupedList';
import HTMLBox from 'components/HTMLBox';
import { Metadata } from "components/Metadata";
import PrimaryLayout from 'components/PrimaryLayout';
import { TagTypes } from 'components/TagSearch.js';
import React, { useEffect, useState } from 'react';
import { getFriendlySpacecraft } from 'api/spacecraft';
import { logPrefetchFallback } from 'services/prefetchFallbackLog';

export default function Spacecraft(props) {
    const {spacecraft, siblings, mission, prefetchedFriendlySpacecraft} = props
    const [relatedSpacecraft, setRelatedSpacecraft] = useState(prefetchedFriendlySpacecraft || siblings)

    useEffect(() => {
        if(prefetchedFriendlySpacecraft) {
            setRelatedSpacecraft(prefetchedFriendlySpacecraft)
        } else if(siblings && siblings.length > 1) {
            logPrefetchFallback('Spacecraft:getFriendlySpacecraft', { identifier: spacecraft?.identifier || null })
            getFriendlySpacecraft(siblings).then(setRelatedSpacecraft, () => setRelatedSpacecraft(siblings))
        }
        return function cleanup() {
            setRelatedSpacecraft(null)
        }
    }, [siblings, prefetchedFriendlySpacecraft, spacecraft])

    return (
        <PrimaryLayout primary={   
            <>
            <Breadcrumbs current={spacecraft} home={mission}/>
            <Typography variant="h1" gutterBottom> { spacecraft.display_name ? spacecraft.display_name : spacecraft.title } </Typography>
            <HTMLBox markup={spacecraft.html1} />
            <Metadata model={spacecraft} tagType={TagTypes.spacecraft} />
            <HTMLBox markup={spacecraft.html2} />
            </>
        } navigational = {
            siblings && siblings.length > 1 &&
                <SpacecraftGroupedList items={relatedSpacecraft} active={spacecraft.identifier}/>
        }/>
    )
}
