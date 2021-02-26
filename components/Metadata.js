import { List, ListItem, Grid, Typography, makeStyles } from '@material-ui/core';
import React from 'react';
import Description from 'components/Description'


const useStyles = makeStyles((theme) => ({
    metadataLabel: {
        marginBottom: 'auto'
    },
}))

export function Metadata({ model }) {
    return <List>
        <MetadataItem label="Description" itemComponent={<Description model={model} />} itemProp="abstract" itemScope itemType="http://schema.org/Text" />
        <MetadataItem label="Identifier (LID)" item={model.identifier} />
        <MetadataItem label="Version" item={model.version_id} />
        <MetadataItem label="DOI" item={model.doi} />
        <MetadataItem label="Authors" item={model.citation_author_list} itemProp="author" itemScope itemType="http://schema.org/Author" />
        <TemporalMedatata label="Time Range" model={model} />
        <MetadataItem label="Status" item={model.publication ? model.publication.publish_status : null} />
    </List>;
}


function TemporalMedatata({label, model}) {
    let times = []
    if(!!model.observation_start_date_time) { times.push("Start Time: " + model.observation_start_date_time) }
    if(!!model.observation_stop_date_time) { times.push("Stop Time: " + model.observation_stop_date_time) }
    if(times.length === 0) { return null }

    return <MetadataItem label={label} item={times.join(' - ')} />
}

export function MetadataItem({ item, itemComponent, label, ...otherProps }) {
    const classes = useStyles()

    if(!item && !itemComponent) return null
    return <ListItem component={Grid} container direction="row" spacing={1} alignItems="flex-start">
        <Grid item sm={3} xs={12}>
            <Typography variant="h6" className={classes.metadataLabel}> { label }</Typography>
        </Grid>
        <Grid item sm={9} xs={12}>
            {itemComponent || <Typography {...otherProps}>{item}</Typography> }
        </Grid>
    </ListItem>
}
