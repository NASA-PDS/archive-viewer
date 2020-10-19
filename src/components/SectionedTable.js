import React from 'react';
import { ContextList } from 'components/ContextLinks';
import { Typography, TableContainer, Table, TableRow, TableCell } from '@material-ui/core';
import { miscGroupName } from 'services/groupings';
import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
    table: {
        border: 0
    },
    cell: {
        borderLeft: 0,
        borderRight: 0
    }
}));

export default function SectionedTable({ groups }) {
    const classes = useStyles();
    groups.sort((a, b) => a.order.localeCompare(b.order));
    return (
        <TableContainer>
            <Table padding="none" className={classes.table}>
                {groups.map(group => {
                    return (
                        <TableRow key={group.name}>
                            <TableCell className={classes.cell} align="center" component="th" scope="row">
                                {(groups.length > 1 || group.name !== miscGroupName) &&
                                    <Typography variant="h6"> {group.name}</Typography>}
                            </TableCell>
                            <TableCell className={classes.cell}>
                                <ContextList items={group.items} />
                            </TableCell>
                        </TableRow>
                    );
                })}
            </Table>
        </TableContainer>
    );
}
