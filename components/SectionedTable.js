import React, { useState } from 'react';
import { ContextList } from 'components/ContextLinks';
import { Typography, TableContainer, Table, TableRow, TableCell, TableBody, Collapse } from '@mui/material';
import { miscGroupName } from 'services/groupings';
import { styled } from '@mui/material/styles';

const StyledTable = styled(Table)({
    border: 0
});

const StyledCell = styled(TableCell)({
    borderLeft: 0,
    borderRight: 0
});

const GroupHeaderCell = styled(TableCell)(({ theme }) => ({
    borderLeft: 0,
    borderRight: 0,
    verticalAlign: 'top',
    paddingTop: theme.spacing(2)
}));

const SectionHeaderTypography = styled(Typography)(({ theme }) => ({
    paddingTop: theme.spacing(4)
}));

export function SectionedTable({groups, ...otherProps}) {
    return <SectionedTableContainer>
        <SectionedTableRows groups={groups} {...otherProps}/>
    </SectionedTableContainer>
}


export function SectionedTableRows({ groups, ...otherProps }) {
    groups.sort((a, b) => a.order > b.order ? 1 : -1);
    return <>
            {groups.map(group => {
                return (
                    <TableRow key={group.name}>
                        <GroupHeaderCell align="center" scope="row">
                            {(groups.length > 1 || group.name !== miscGroupName) &&
                                <Typography variant="h6"> {group.name}</Typography>}
                        </GroupHeaderCell>
                        <StyledCell>
                            <ContextList items={group.items} {...otherProps} />
                        </StyledCell>
                    </TableRow>
                );
            })}
    </>
}

export function SectionedTableContainer({children}) {
    return <TableContainer>
        <StyledTable padding="none">
            <TableBody>
            { children }
            </TableBody></StyledTable>
        </TableContainer>
}

export function SectionedTableHeader({title}) {
    return <TableRow>
        <TableCell colSpan={2}><Typography variant="h2">{title}</Typography></TableCell>
    </TableRow>
}

export function SectionedTableMinorHeader({title}) {
    return <TableRow>
        <TableCell colSpan={2}><SectionHeaderTypography variant="h3" color="textSecondary">{title}</SectionHeaderTypography></TableCell>
    </TableRow>
}