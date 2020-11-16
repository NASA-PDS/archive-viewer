import { Button, Grid, List, ListItem, Typography } from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { getBundlesForCollection } from 'api/dataset.js';
import { isMockupMode, isPdsOnlyMode } from 'api/mock';
import ErrorMessage from 'components/Error.js';
import Loading from 'components/Loading.js';
import React from 'react';

export default class Main extends React.Component {

    constructor(props) {
        super(props)
        this.state = { bundles: [], loaded: false }
    }

    componentDidMount() {
        getBundlesForCollection(this.props.dataset).then(result => {
                this.setState({
                    bundles: result,
                    loaded: true
                })
            }, error => 
            this.setState({ error }))
    }

    render() {
        const {bundles, error, loaded} = this.state
        const { dataset } = this.props
        if(!loaded) { return <Loading />}
        if(error) {
            return <ErrorMessage error={error}></ErrorMessage>
        } else if(bundles.length === 0 && !dataset.other_instruments_url && !dataset.mission_bundle) { return null }
        return (
            <List>
                { bundles.length > 0 && <SplitListItem left={<Typography variant="h6"> Parent Bundle{bundles.length > 1 ? 's':''}</Typography>} right={
                    <>{bundles.map(bundle => {
                        return <BrowseButton key={bundle.identifier} url={buildUrl(bundle.identifier)} title={bundle.display_name ? bundle.display_name : bundle.title} />
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
            <BrowseButton url={url ? url : buildUrl(identifier)} isPrimary={isPrimary} title={buttonTitle ? buttonTitle : `View ${label}`}/>
        }/>
}

function BrowseButton({url, title, isPrimary}) {
    if(!url) return null
    return <Button color="primary" variant={isPrimary ? "contained" : "text"} size={isPrimary ? "large" : "medium"} href={url} endIcon={isPrimary ? <OpenInNewIcon/> : null}>{title}</Button>
}

function buildUrl(identifier) {
    let url = `?identifier=${identifier}`
    if(isPdsOnlyMode()) { url += "&pdsOnly=true"}
    if(isMockupMode()) { url += "&mockup=true"}
    return url
}
