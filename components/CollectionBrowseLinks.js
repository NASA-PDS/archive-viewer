import { Button, Grid, List, ListItem, Typography } from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { getBundlesForCollection } from 'api/dataset.js';
import ErrorMessage from 'components/Error.js';
import Loading from 'components/Loading.js';
import React, { useEffect, useState } from 'react';
import InternalLink from './InternalLink';

export default function CollectionBrowseLinks({dataset}) {
    const [bundles, setBundles] = useState([])
    const [loaded, setLoaded] = useState(false) 
    const [error, setError] = useState(null)

    useEffect(() => {
        getBundlesForCollection(dataset).then(result => {
            setBundles(result)
            setLoaded(true)
        }, setError)
    }, [dataset.identifier])

    if(!loaded) { return <Loading />}
    if(error) {
        return <ErrorMessage error={error}></ErrorMessage>
    } else if(bundles.length === 0 && !dataset.other_instruments_url && !dataset.mission_bundle) { return null }
    return (
        <List>
            { bundles.length > 0 && <SplitListItem left={<Typography variant="h6"> Parent Bundle{bundles.length > 1 ? 's':''}</Typography>} right={
                <>{bundles.map(bundle => {
                    return <BrowseButton key={bundle.identifier} identifier={bundle.identifier} title={bundle.display_name ? bundle.display_name : bundle.title} />
                })}</>
            } />}
            <BrowseItem url={dataset.browse_url ? dataset.browse_url : dataset.resource_url} label="Browse" buttonTitle="Browse this Collection" isPrimary={true} />
            <BrowseItem identifier={dataset.mission_bundle} label="Mission Bundle"/>
            <BrowseItem identifier={dataset.mission_bundle} label="Other Instruments"/>
            <BrowseItem identifier={dataset.checksums_url} label="Checksums"/>
            <BrowseItem identifier={dataset.mission_bundle} label="Download" buttonTitle={`Download Collection${dataset.download_size ? ' (' + dataset.download_size + ')' : ''}`}/>
        </List>

    )
}

function SplitListItem({left, right}) {
    return <ListItem component={Grid} container direction="row" justify="flex-start" spacing={1}>
    <Grid item sm={3} xs={12}>
        {left}
    </Grid>
    <Grid item sm={9} xs={12}>
        {right}
    </Grid>
</ListItem>
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