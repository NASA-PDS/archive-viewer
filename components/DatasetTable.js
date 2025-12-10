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

export default function DatasetTable({ groups }) {
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
                            {group.items.map(dataset => <DatasetRow dataset={dataset} key={dataset.identifier}/>)}
                        </React.Fragment>
                    )}
                </TableBody>
            </StyledTable>
        </TableContainer>
    );
}

function DatasetRow({dataset}) {
    const [open, setOpen] = useState(false)

    return <>
        <TableRow >
            <StyledCell>
                <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                    {open ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
            </StyledCell>            
            <StyledCell>
                <ContextLink item={dataset}/>
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
                <DatasetSynopsis dataset={dataset}/>
            </Collapse>
            </TableCell>
        </TableRow>
        </>
}

function DatasetSynopsis({dataset}) {
    return <Box p={2}>
        <Metadata model={dataset} tagType={TagTypes.dataset}/>
        <CollectionList dataset={dataset} />
    </Box>
}