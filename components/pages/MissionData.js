import { Collapse, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { getDatasetsForMission } from 'api/mission.js';
import CollectionList from 'components/CollectionList.js';
import { ContextLink } from 'components/ContextLinks';
import { Menu } from 'components/ContextObjects';
import { groupType } from 'components/ListBox';
import Loading from 'components/Loading';
import { Metadata } from "components/Metadata";
import { DeliveryInfo } from 'components/pages/Dataset.js';
import PrimaryLayout from 'components/PrimaryLayout';
import React, { useEffect, useState } from 'react';
import { groupByRelatedItems } from 'services/groupings';
import { ExpandLess, ExpandMore } from '@material-ui/icons'
import { getFriendlyInstrumentsForSpacecraft, getFriendlySpacecraft } from 'api/spacecraft';


export const useStyles = makeStyles((theme) => ({
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


export default function MissionData(props) {
    const {mission} = props
    const [datasets, setDatasets] = useState(null)
    const [groupMode, setGroupMode] = useState(groupType.instrument)
    const [instruments, setInstruments] = useState(props.instruments)
    const [spacecraft, setSpacecraft] = useState(props.spacecraft)
    
    useEffect(() => {
        if (!!props.spacecraft) getFriendlySpacecraft(props.spacecraft).then(setSpacecraft, console.error)
        return function cleanup() {
            setSpacecraft(null)
        }
    }, [props.spacecraft])
    
    useEffect(() => {
        if (!!props.instruments && !!props.spacecraft) getFriendlyInstrumentsForSpacecraft(props.instruments, props.spacecraft).then(setInstruments, console.error)
        return function cleanup() {
            setInstruments(null)
        }
    }, [props.instruments, props.spacecraft])

    useEffect(() => {
        if(!!mission && !!props.instruments && !!props.spacecraft) getDatasetsForMission(mission, props.spacecraft, props.instruments).then(setDatasets, console.error)
        return function cleanup() { 
            setDatasets(null)
        }
    }, [mission, props.spacecraft, props.instruments])


    let groupObjects, groupField
    switch(groupType) {
        case groupType.spacecraft:
            groupObjects = spacecraft
            groupField = 'instrument_host_ref'
        case groupType.instrument:
        default: 
            groupObjects = instruments
            groupField = 'instrument_ref'
            
    }

    return (
        <>
            <Menu/>
            <PrimaryLayout primary={!!datasets ? 
                <>
                    <Typography variant="h1" gutterBottom>All datasets</Typography>
                    <MissionDataTable groups={groupByRelatedItems(datasets, groupObjects, groupField)} />
                </>
                : <Loading/>
            }/>
        </>
    )
}

function MissionDataTable({ groups }) {
    const classes = useStyles();
    // groups.sort((a, b) => a.order.localeCompare(b.order));
    return (
        <TableContainer>
            <Table stickyHeader padding="none"  className={classes.table}>
                <TableHead>
                    <TableCell/>
                    <TableCell className={classes.headerCell}>Title</TableCell>
                    <TableCell className={classes.headerCell}>Processing Level</TableCell>
                    <TableCell className={classes.headerCell}>Publish Date</TableCell>
                    <TableCell className={classes.headerCell}>Start Time</TableCell>
                    <TableCell className={classes.headerCell}>End Time</TableCell>
                </TableHead>
                <TableBody>
                    {groups.map(group => 
                        <>
                            {groups.length > 1 && <TableRow>
                                <TableCell/>
                                <TableCell colSpan={5}><Typography variant="h4">{group.name}</Typography></TableCell>
                            </TableRow>}
                            {group.items.map(dataset => <DatasetRow dataset={dataset} key={dataset.identifier}/>)}
                        </>
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
            <TableCell className={classes.cell}>
                {dataset.primary_result_processing_level}
            </TableCell>
            <TableCell className={classes.cell}>
                {dataset.citation_publication_year}
            </TableCell>
            <TableCell className={classes.cell}>
                {dataset.observation_start_date_time}
            </TableCell>
            <TableCell className={classes.cell}>
                {dataset.observation_start_date_time}
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
        <Metadata model={dataset} />
        <CollectionList dataset={dataset} />
    </Box>
}