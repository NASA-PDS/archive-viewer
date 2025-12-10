import Router from "next/router"
import { Box, Chip, Dialog, DialogContent, DialogTitle, Link, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import TagSearch, { TagTypes } from 'components/TagSearch.js';
import React from 'react';

const StyledChip = styled(Chip)(({ theme }) => ({
    margin: theme.spacing(0.5),
}));
  
export function TagList({tags, type}) {
    const [open, setOpen] = React.useState(false);
    const [currentTag, setTag] = React.useState(null);
    const openTag = (tag) => {
        setTag(tag)
        setOpen(true)
    }
    if(!tags || tags.length === 0) return null

    Router.events.on("routeChangeStart", () => setOpen(false))

    return (
        <>
        <Box mb={1}>
            {tags.map(tag => 
                <Tooltip title="View Category Search" key={tag} >
                    <Link onClick={() => openTag(tag)}>
                        <StyledChip clickable={true} color="primary" label={tag}/>
                    </Link>
                </Tooltip>
            )}
        </Box>
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
            scroll={'paper'}
            aria-labelledby="scroll-dialog-title"
        >
            <DialogTitle id="scroll-dialog-title">{type} tagged with {currentTag}</DialogTitle>
            <DialogContent>
                <TagSearch type={type} tags={[currentTag]} embedded={true}/>
            </DialogContent>
        </Dialog>
        </>
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