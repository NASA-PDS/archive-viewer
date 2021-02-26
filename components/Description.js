import React, { useState } from 'react';
import { Typography, Link } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
    description: {
        whiteSpace: 'pre-line',
    }
}));

export const ridiculousLength = 100
export const previewLength = 750

export default function Description(props) {
    const { model } = props;
    const { display_description } = model;
    const description = display_description || model.description || model.instrument_description || model.instrument_host_description || model.investigation_description || model.target_description
    const alwaysShow = description.length < ridiculousLength;
    const [expanded, setExpanded] = useState(alwaysShow);
    const classes = useStyles();

    return (
        <Typography variant="body1" className={classes.description}>
            {!description ? 'No description is available.' : expanded ? <>
                {description}{alwaysShow ? null : <Link onClick={() => setExpanded(false)}>Hide</Link>}
            </> : <>
                    {description.length < previewLength ? description : (<>{shorten(description)}<Link onClick={() => setExpanded(true)}>...Show More</Link></>)}
                </>}
        </Typography>
    );
}

function shorten(description) {
    return description.split('').splice(0,previewLength).join('') + '... '
}
