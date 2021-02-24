import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TargetHeader } from 'components/ContextObjects'
import Target from 'components/pages/Target';

const drawerWidth = 360;

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
        // width: "100%",
        // height: "100%",
        display: 'flex'
    }
}));

export default function Targetontext({lidvid, model, type, pdsOnly, mockup}) {
    
    const classes = useStyles()

    return (
        <div className={classes.root}>
            <TargetHeader type={type} target={model} pdsOnly={pdsOnly}/>
            <Target target={model} pdsOnly={pdsOnly} mockup={mockup} lidvid={lidvid} />
        </div>
    )
}