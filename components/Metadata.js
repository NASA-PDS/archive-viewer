import { List, Typography } from '@material-ui/core';
import Description from 'components/Description';
import React from 'react';
import { LabeledListItem } from './SplitListItem';
import { TagList } from './TagList';


export function Metadata({ model, tagType }) {
    if(!model) return null
    return <List style={{maxWidth:'100%;'}}>
        {/* Tags disabled for now <MetadataItem label="Tags" itemComponent={<TagList tags={model.tags} type={tagType} />} /> */}
        <MetadataItem label="Description" itemComponent={<Description model={model} />} itemProp="abstract" />
        <MetadataItem label="Identifier (LID)" item={model.identifier} itemProp="identifier"/>
        <MetadataItem label="Version" item={model.version_id} itemProp="version"/>
        <MetadataItem label="DOI" item={model.doi} />
        {/* <MetadataItem label="Authors" item={model.citation_author_list} itemProp="author" /> */}
        <AuthorList label="Authors" model={model.citation_author_list} />
        <TemporalMedatata label="Time Range" model={model} />
        <MetadataItem label="Status" item={model.publication ? model.publication.publish_status : null} />
    </List>;
}


function TemporalMedatata({label, model}) {
    let times = []
    if(!!model.observation_start_date_time) { times.push("Start Time: " + new Date(model.observation_start_date_time).toLocaleString()) }
    if(!!model.observation_stop_date_time && model.observation_stop_date_time !== '3000-01-01T00:00:00Z') { times.push("Stop Time: " + new Date(model.observation_stop_date_time).toLocaleString()) }
    if(times.length === 0) { return null }

    return <MetadataItem label={label} item={times.join(' - ')} />
}

export function MetadataItem({ item, itemComponent, label, ...otherProps }) {

    if(!item && !itemComponent) return null
    return <LabeledListItem label={label} item = {
            itemComponent || <Typography {...otherProps}>{item}</Typography> 
        }/>
}

function AuthorList({model}) {
    let authors = model && model.split(';')
    return authors ? <>
        <MetadataItem label="Authors" itemComponent={<>
            { authors.map((author, index) => <><span itemProp="author">{author}</span>{index < authors.length -1 ? ';' : ''}</>)}
        </>}/>  
    </> : null
}