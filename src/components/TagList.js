import React from 'react';
import {TagTypes} from 'components/TagSearch.js'
import { Chip, Link, Typography, Box, Hidden } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    header: {
      display: 'inline-block',
      height: '100%',
      verticalAlign: "middle"
    },
    chip: {
      margin: theme.spacing(0.5),
    }
}));
  
function TagList({tags, type}) {
    const classes = useStyles();
    if(!tags || tags.length === 0) return null

    return (
        <Box>
            <Hidden mdDown><Typography component="span" variant="h5" className={classes.header}> Relevant Tags: </Typography></Hidden>
            {tags.map(tag => 
                <Link href={`?tag=${tag}&type=${type}`}>
                    <Chip className={classes.chip} clickable="true" color="primary" label={tag}/>
                </Link>
            )}
        </Box>
    )
}

export function TargetTagList({tags}) {
    return <TagList tags={tags} type={TagTypes.target} />
}
export function SpacecraftTagList({tags}) {
    return <TagList tags={tags} type={TagTypes.spacecraft} />
}
export function MissionTagList({tags}) {
    return <TagList tags={tags} type={TagTypes.mission} />
}
export function InstrumentTagList({tags}) {
    return <TagList tags={tags} type={TagTypes.instrument} />
}
export function DatasetTagList({tags}) {
    return <TagList tags={tags} type={TagTypes.dataset} />
}