import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TargetHeader } from 'components/ContextHeaders'
import Target from 'components/pages/Target';
import { types, pagePaths } from 'services/pages.js';
import TargetRelated from 'components/pages/TargetRelated';
import TargetMissions from 'components/pages/TargetMissions';
import TargetData from 'components/pages/TargetData';
import TargetTools from 'components/pages/TargetTools';
import { Bundle, Collection } from 'components/pages/Dataset';
import { getFriendlyTargets } from 'api/target';

const drawerWidth = 360;

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
    }
}));

export default function TargetContext({target, model, type, extraPath, ...otherProps}) {
    const [friendlyTarget, setFriendlyTarget] = useState(null)
    const classes = useStyles()

    useEffect(() => {
        // check if this target has already pulled in friendly metadata
        if(!target.logical_identifier) {
            getFriendlyTargets([target]).then(targets => setFriendlyTarget(targets[0]), console.error)
        } else {
            setFriendlyTarget(target)
        }

    }, [target])

    let mainContent = null, pageType = type

    switch(type) {
        case types.TARGET: {
            // main lid is for the target; figure out sub-path
            if(!!extraPath && extraPath.length > 0) {
                if(!!extraPath.includes(pagePaths[types.TARGETRELATED])) {
                    mainContent = <TargetRelated target={target} />
                    pageType = types.TARGETRELATED
                } else if(!!extraPath.includes(pagePaths[types.TARGETMISSIONS])) {
                    mainContent = <TargetMissions target={target} />
                    pageType = types.TARGETMISSIONS
                } else if(!!extraPath.includes(pagePaths[types.TARGETDATA])) {
                    mainContent = <TargetData target={target}/>
                    pageType = types.TARGETDATA
                } else if(!!extraPath.includes(pagePaths[types.TARGETTOOLS])) {
                    mainContent = <TargetTools target={target}/>
                    pageType = types.TARGETTOOLS
                }
            } else {
                mainContent = <Target target={target}  {...otherProps} />
            }
            break;
        } 
        // main lid is for a dataset
        case types.BUNDLE: 
            mainContent = <Bundle dataset={model} context={target} {...otherProps}/>
            pageType=types.TARGETDATA
            break
        case types.COLLECTION: 
            mainContent = <Collection dataset={model} context={target} {...otherProps} />
            pageType=types.TARGETDATA
            break
            
    }

    return (
        <div className={classes.root}>
            <TargetHeader page={pageType} target={friendlyTarget || target} pdsOnly={otherProps.pdsOnly}/>
            {mainContent}
        </div>
    )
}