import { Box, Collapse, IconButton, makeStyles, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import CollectionList from 'components/CollectionList.js';
import { ContextLink } from 'components/ContextLinks';
import { Metadata } from "components/Metadata";
import React, { useState } from 'react';
import { TagTypes } from 'components/TagSearch.js';

const useStyles = makeStyles((theme) => ({
    table: {
        border: 0
    },
    cell: {
        border: 0
    },
    headerCell: {
        paddingRight: theme.spacing(2)
    }
}));

export default function DatasetTable({ groups }) {
    const classes = useStyles();
    if(!groups || groups.length === 0) return null
    return (
        <TableContainer>
            <Table stickyHeader padding="none"  className={classes.table}>
                <TableHead>
                    <TableCell/>
                    <TableCell className={classes.headerCell}>Title</TableCell>
                    {/* <TableCell className={classes.headerCell}>Processing Level</TableCell> */}
                    <TableCell className={classes.headerCell} padding="default">Published</TableCell>
                    <TableCell className={classes.headerCell} padding="default">Start Date</TableCell>
                    <TableCell className={classes.headerCell} padding="default">End Date</TableCell>
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
            </Table>
        </TableContainer>
    );
}

function DatasetRow({dataset}) {
    const classes = useStyles();
    const [open, setOpen] = useState(false)

    return <>
        <TableRow >
            <TableCell className={classes.cell}>
                <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                    {open ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
            </TableCell>            
            <TableCell className={classes.cell}>
                <ContextLink item={dataset}/>
            </TableCell>
            {/* <TableCell className={classes.cell}>
                {dataset.primary_result_processing_level}
            </TableCell> */}
            <TableCell className={classes.cell} padding="default">
                {dataset.citation_publication_year}
            </TableCell>
            <TableCell className={classes.cell} padding="default">
                {new Date(dataset.observation_start_date_time).toLocaleDateString()}
            </TableCell>
            <TableCell className={classes.cell} padding="default">
                {new Date(dataset.observation_start_date_time).toLocaleDateString()}
            </TableCell>
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