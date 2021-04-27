import { Button, List, Typography } from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import React from 'react';
import InternalLink from './InternalLink';
import { SplitListItem } from './SplitListItem';

export default function CollectionBrowseLinks({dataset, bundles}) {

    if(bundles.length === 0 && !dataset.other_instruments_url && !dataset.mission_bundle) { return null }
    return (
        <List>
            { bundles.length > 0 && <SplitListItem left={<Typography variant="h6"> Parent Bundle{bundles.length > 1 ? 's':''}</Typography>} right={
                <>{bundles.map(bundle => {
                    return <BrowseButton key={bundle.identifier} identifier={bundle.identifier} title={bundle.display_name ? bundle.display_name : bundle.title} />
                })}</>
            } />}
            <BrowseItem url={dataset.browse_url ? dataset.browse_url : dataset.resource_url} label="Browse" buttonTitle="Browse this Collection" isPrimary={true} />
            <BrowseItem identifier={dataset.mission_bundle} label="Mission Information Bundle"/>
            <BrowseItem url={dataset.other_instruments_url} label="Other Instruments"/>
            <BrowseItem url={dataset.checksums_url} label="Checksums"/>
            <BrowseItem url={dataset.download_url} label="Download" buttonTitle={`Download Collection${dataset.download_size ? ' (' + dataset.download_size + ')' : ''}`}/>
        </List>

    )
}

function BrowseItem({ label, identifier, url, buttonTitle, isPrimary }) {
    if(!url && !identifier) { return null }
    return <SplitListItem left={
            <Typography variant="h6"> { label }</Typography>
        } right={
            <BrowseButton url={url} identifier={identifier} isPrimary={isPrimary} title={buttonTitle ? buttonTitle : `View ${label}`}/>
        }/>
}

function BrowseButton({url, identifier, title, isPrimary}) {
    if(!url && !identifier) return null
    const button = <Button color="primary" variant={isPrimary ? "contained" : "text"} href={url} size={isPrimary ? "large" : "medium"} endIcon={isPrimary ? <OpenInNewIcon/> : null}>{title}</Button>
    return (
        identifier ? <InternalLink identifier={identifier} passHref>{button}</InternalLink> : button
    )
}