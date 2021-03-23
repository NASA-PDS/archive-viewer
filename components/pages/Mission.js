import { Typography, Button } from '@material-ui/core';
import { ExitToApp } from '@material-ui/icons';
import { getPrimaryBundleForMission } from 'api/mission.js';
import { Menu } from 'components/ContextObjects';
import InternalLink from 'components/InternalLink';
import { Metadata } from "components/Metadata";
import PrimaryLayout from 'components/PrimaryLayout';
import { LabeledListItem } from 'components/SplitListItem';
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
        <>
            <Menu/>
            <PrimaryLayout primary={
                <>
                    <Typography variant="h1" gutterBottom> { mission.display_name ? mission.display_name : mission.title } </Typography>
                    <Metadata model={mission} />
                    

                    { primaryBundle && 
                        <LabeledListItem label="Bundle" item={
                            <BundleLink identifier={primaryBundle.identifier} label="View Mission Bundle"/>
                        }/>
                    }

                </>
            } />
        </>
    )
}

function BundleLink({identifier, label}) {
    return <InternalLink identifier={identifier} passHref>
            <Button color="primary" variant={"contained"} size={"large"} endIcon={<ExitToApp/>}>{label}</Button>
    </InternalLink>
}


// function DatasetSynopsis({dataset}) {
//     return <Box my={2}>
//         <Typography variant="h2" gutterBottom>{dataset.display_name || dataset.title}</Typography>
//         <DeliveryInfo dataset={dataset} />
//         <Metadata dataset={dataset} />
//         <MoreInformation dataset={dataset} />
//         <CollectionList dataset={dataset} />
//     </Box>
// }