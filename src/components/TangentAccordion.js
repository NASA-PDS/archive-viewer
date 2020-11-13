import React from 'react';
import { Accordion, AccordionSummary, Box, Divider, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ExpandLess, ExpandMore, Info } from '@material-ui/icons'

const useStyles = makeStyles((theme) => ({
    container: {
        backgroundColor: theme.palette.background.paper,
        margin: theme.spacing(1),
        padding: theme.spacing(1)
    },
    [theme.breakpoints.up('sm')]: {
        container: {
            margin: theme.spacing(2),
            padding: theme.spacing(2)
        }
    },
}));

export default function(props) {
    const {title, children, ...remainingProps} = props
    const classes = useStyles()
    return <Accordion TransitionProps={{ unmountOnExit: true }} {...remainingProps} component={Box} my={1}>
        { title && <AccordionSummary expandIcon={<ExpandMore/>}><Typography variant="body">{title}</Typography></AccordionSummary> }
        { title && <Divider/> }
        {children}
    </Accordion>
}