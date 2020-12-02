import { Accordion, AccordionSummary, Box, Divider, Typography } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import React from 'react';

export default function(props) {
    const {title, children, ...remainingProps} = props
    return <Accordion TransitionProps={{ unmountOnExit: true }} {...remainingProps} component={Box} my={1}>
        { title && <AccordionSummary expandIcon={<ExpandMore/>}><Typography variant="body1">{title}</Typography></AccordionSummary> }
        { title && <Divider/> }
        {children}
    </Accordion>
}