import React, { useState } from 'react';
import { ContextList } from 'components/ContextLinks';
import { Typography, TableContainer, Table, TableRow, TableCell, TableBody, Collapse } from '@mui/material';
import { miscGroupName } from 'services/groupings';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
    table: {
        border: 0
    },
    cell: {
        borderLeft: 0,
        borderRight: 0
    },
    groupHeader: {
        verticalAlign: 'top',
        paddingTop: theme.spacing(2)
    },
    sectionHeader: {
        paddingTop: theme.spacing(4)
    }
}));

export function SectionedTable({groups, ...otherProps}) {
    return <SectionedTableContainer>
        <SectionedTableRows groups={groups} {...otherProps}/>
    </SectionedTableContainer>
}


export function SectionedTableRows({ groups, ...otherProps }) {
    const classes = useStyles();
    groups.sort((a, b) => a.order > b.order ? 1 : -1);
    return <>
            {groups.map(group => {
                return (
                    <TableRow key={group.name}>
                        <TableCell className={classes.cell} align="center" scope="row" className={classes.groupHeader}>
                            {(groups.length > 1 || group.name !== miscGroupName) &&
                                <Typography variant="h6"> {group.name}</Typography>}
                        </TableCell>
                        <TableCell className={classes.cell}>
                            <ContextList items={group.items} {...otherProps} />
                        </TableCell>
                    </TableRow>
                );
            })}
    </>
}

export function SectionedTableContainer({children}) {
    const classes = useStyles();
    return <TableContainer>
        <Table padding="none" className={classes.table}>
            <TableBody>
            { children }
            </TableBody></Table>
        </TableContainer>
}

export function SectionedTableHeader({title}) {
    const classes = useStyles();
    return <TableRow>
        <TableCell colSpan={2}><Typography variant="h2">{title}</Typography></TableCell>
    </TableRow>
}

export function SectionedTableMinorHeader({title}) {
    const classes = useStyles();
    return <TableRow>
        <TableCell colSpan={2}><Typography variant="h3" color="textSecondary" className={classes.sectionHeader}>{title}</Typography></TableCell>
    </TableRow>
}