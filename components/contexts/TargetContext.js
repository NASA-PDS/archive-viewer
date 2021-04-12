import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TargetHeader } from 'components/ContextHeaders'
import Target from 'components/pages/Target';
import { types, pagePaths } from 'services/pages.js';
import TargetRelated from 'components/pages/TargetRelated';
import TargetMissions from 'components/pages/TargetMissions';
import TargetData from 'components/pages/TargetData';
import TargetTools from 'components/pages/TargetTools';

const drawerWidth = 360;

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
    }
}));

export default function Targetontext({lidvid, model, extraPath, pdsOnly, mockup}) {
    
    const classes = useStyles()

    let mainContent = null, pageType = types.TARGET
    if(!!extraPath && extraPath.length > 0) {
        if(!!extraPath.includes(pagePaths[types.TARGETRELATED])) {
            mainContent = <TargetRelated target={model} />
            pageType = types.TARGETRELATED
        } else if(!!extraPath.includes(pagePaths[types.TARGETMISSIONS])) {
            mainContent = <TargetMissions target={model} />
            pageType = types.TARGETMISSIONS
        } else if(!!extraPath.includes(pagePaths[types.TARGETDATA])) {
            mainContent = <TargetData target={model}/>
            pageType = types.TARGETDATA
        } else if(!!extraPath.includes(pagePaths[types.TARGETTOOLS])) {
            mainContent = <TargetTools target={model}/>
            pageType = types.TARGETTOOLS
        }
    } else {
        mainContent = <Target target={model} pdsOnly={pdsOnly} mockup={mockup} lidvid={lidvid} />
    }

    return (
        <div className={classes.root}>
            <TargetHeader page={pageType} target={model} pdsOnly={pdsOnly}/>
            {mainContent}
        </div>
    )
}