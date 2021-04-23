import { List, Typography } from '@material-ui/core';
import Description from 'components/Description';
import React from 'react';
import { LabeledListItem } from './SplitListItem';



export function Metadata({ model }) {
    if(!model) return null
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
    if(!!model.observation_start_date_time) { times.push("Start Time: " + new Date(model.observation_start_date_time).toLocaleString()) }
    if(!!model.observation_stop_date_time) { times.push("Stop Time: " + new Date(model.observation_stop_date_time).toLocaleString()) }
    if(times.length === 0) { return null }

    return <MetadataItem label={label} item={times.join(' - ')} />
}

export function MetadataItem({ item, itemComponent, label, ...otherProps }) {

    if(!item && !itemComponent) return null
    return <LabeledListItem label={label} item = {
            itemComponent || <Typography {...otherProps}>{item}</Typography> 
        }/>
}
