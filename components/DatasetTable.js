import { Box, Collapse, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import CollectionList from 'components/CollectionList.js';
import { ContextLink } from 'components/ContextLinks';
import { Metadata } from "components/Metadata";
import React, { useState } from 'react';
import { TagTypes } from 'components/TagSearch.js';

const StyledTable = styled(Table)({
    border: 0
});

const StyledCell = styled(TableCell)({
    border: 0
});

const HeaderCell = styled(TableCell)(({ theme }) => ({
    paddingRight: theme.spacing(2)
}));

export default function DatasetTable({ groups, prefetchedCollectionsById, contextHint, targetHint }) {
    if(!groups || groups.length === 0) return null
    return (
        <TableContainer sx={{ marginTop: 2, marginBottom: 2 }}>
            <StyledTable stickyHeader padding="none">
                <TableHead sx={{ padding: 2 }}>
                    <TableRow>
                        <TableCell/>
                        <HeaderCell>Title</HeaderCell>
                        {/* <HeaderCell>Processing Level</HeaderCell> */}
                        <HeaderCell>Published</HeaderCell>
                        <HeaderCell>Start Date</HeaderCell>
                        <HeaderCell>End Date</HeaderCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {groups.map(group => 
                        <React.Fragment key={group.name}>
                            {groups.length > 1 && <TableRow>
                                <TableCell/>
                                <TableCell colSpan={5}><Typography variant="h4">{group.name}</Typography></TableCell>
                            </TableRow>}
                            {group.items.map(dataset => <DatasetRow dataset={dataset} key={dataset.identifier} prefetchedCollections={prefetchedCollectionsById?.[dataset.identifier]} contextHint={contextHint} targetHint={targetHint} />)}
                        </React.Fragment>
                    )}
                </TableBody>
            </StyledTable>
        </TableContainer>
    );
}

function DatasetRow({dataset, prefetchedCollections, contextHint, targetHint}) {
    const [open, setOpen] = useState(false)

    return <>
        <TableRow >
            <StyledCell>
                <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                    {open ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
            </StyledCell>            
            <StyledCell>
                <ContextLink item={dataset} contextHint={contextHint} targetHint={targetHint}/>
            </StyledCell>
            {/* <StyledCell>
                {dataset.primary_result_processing_level}
            </StyledCell> */}
            <StyledCell>
                {dataset.citation_publication_year}
            </StyledCell>
            <StyledCell>
                {new Date(dataset.observation_start_date_time).toLocaleDateString()}
            </StyledCell>
            <StyledCell>
                {new Date(dataset.observation_start_date_time).toLocaleDateString()}
            </StyledCell>
        </TableRow>
        <TableRow>
            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <DatasetSynopsis dataset={dataset} prefetchedCollections={prefetchedCollections} contextHint={contextHint} targetHint={targetHint}/>
            </Collapse>
            </TableCell>
        </TableRow>
        </>
}

function DatasetSynopsis({dataset, prefetchedCollections, contextHint, targetHint}) {
    return <Box p={2}>
        <Metadata model={dataset} tagType={TagTypes.dataset}/>
        <CollectionList dataset={dataset} prefetchedCollections={prefetchedCollections} contextHint={contextHint} targetHint={targetHint} />
    </Box>
}
