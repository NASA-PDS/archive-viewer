import { Button, Typography } from '@material-ui/core';
import { getPrimaryBundleForMission } from 'api/mission.js';
import HTMLBox from 'components/HTMLBox';
import InternalLink from 'components/InternalLink';
import { Metadata } from "components/Metadata";
import PrimaryLayout from 'components/PrimaryLayout';
import { LabeledListItem } from 'components/SplitListItem';
import { TagTypes } from 'components/TagSearch.js';
import React, { useEffect, useState } from 'react';


export default function Mission({mission, lidvid, pdsOnly}) {
    const [primaryBundle, setPrimaryBundle] = useState(null)

    useEffect(() => {
        if(!pdsOnly) { 
            getPrimaryBundleForMission(mission).then((bundle) => {
                setPrimaryBundle(bundle)
            }, er => console.error(er))
        }

        return function cleanup() { 
            setPrimaryBundle(null)
        }
    }, [lidvid])

    return (
        <PrimaryLayout primary={
            <>
                <Typography variant="h1" gutterBottom> { mission.display_name ? mission.display_name : mission.title } </Typography>
                <HTMLBox markup={mission.html1} />
                <Metadata model={mission} tagType={TagTypes.mission}/>
                { primaryBundle && 
                    <LabeledListItem label="Bundle" item={
                        <BundleLink identifier={primaryBundle.identifier} label="View Mission Information Bundle"/>
                    }/>
                }
                <HTMLBox markup={mission.html2} />   

            </>
        } />
    )
}

function BundleLink({identifier, label}) {
    return <InternalLink identifier={identifier} passHref>
            <Button color="primary" variant={"contained"} size={"large"}>{label}</Button>
    </InternalLink>
}