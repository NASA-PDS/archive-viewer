import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import { TargetHeader } from 'components/ContextHeaders'
import Target from 'components/pages/Target';
import { types, pagePaths } from 'services/pages.js';
import TargetRelated from 'components/pages/TargetRelated';
import TargetMissions from 'components/pages/TargetMissions';
import TargetData from 'components/pages/TargetData';
import TargetTools from 'components/pages/TargetTools';
import { Bundle, Collection } from 'components/pages/Dataset';
import MoreData from 'components/pages/MoreData';
import { contexts } from 'services/pages';
import { getFriendlyTargets, getMissionsForTarget } from 'api/target';
import { logPrefetchFallback } from 'services/prefetchFallbackLog';

const drawerWidth = 360;

const Root = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
}));

export default function TargetContext({target, model, type, extraPath, ...otherProps}) {
    const prefetch = otherProps.prefetch || {}
    const [friendlyTarget, setFriendlyTarget] = useState(prefetch.friendlyTarget || null)
    const [missions, setMissions] = useState(prefetch.targetMissions || null)
    const needsTargetMissions = type === types.TARGET
        && !!extraPath
        && (extraPath.includes(pagePaths[types.TARGETMISSIONS]) || extraPath.includes(pagePaths[types.MOREDATA]))

    useEffect(() => {
        if(prefetch.friendlyTarget) {
            setFriendlyTarget(prefetch.friendlyTarget)
            if(needsTargetMissions) {
                setMissions(prefetch.targetMissions || null)
            }
            return
        }

        const resolvedTarget = !target.logical_identifier
            ? (() => {
                logPrefetchFallback('TargetContext:getFriendlyTargets', { identifier: target?.identifier || null })
                return getFriendlyTargets([target]).then(results => results[0] || target)
            })()
            : Promise.resolve(target)

        resolvedTarget.then(nextTarget => {
            setFriendlyTarget(nextTarget)
            if(needsTargetMissions) {
                if(prefetch.targetMissions) {
                    setMissions(prefetch.targetMissions)
                } else {
                    logPrefetchFallback('TargetContext:getMissionsForTarget', { identifier: nextTarget?.identifier || null })
                    getMissionsForTarget(nextTarget).then(setMissions, () => setMissions([]))
                }
            }
        }, console.error)

    }, [target, needsTargetMissions, prefetch.friendlyTarget, prefetch.targetMissions])

    let mainContent = null, pageType = type

    switch(type) {
        case types.TARGET: {
            // main lid is for the target; figure out sub-path
            if(!!extraPath && extraPath.length > 0) {
                if(!!extraPath.includes(pagePaths[types.TARGETRELATED])) {
                    mainContent = <TargetRelated target={target} prefetchedRelatedTargets={prefetch.relatedTargets} />
                    pageType = types.TARGETRELATED
                } else if(!!extraPath.includes(pagePaths[types.TARGETMISSIONS])) {
                    mainContent = <TargetMissions target={target} prefetchedMissions={prefetch.targetMissions} />
                    pageType = types.TARGETMISSIONS
                } else if(!!extraPath.includes(pagePaths[types.TARGETDATA])) {
                    mainContent = <TargetData target={target} prefetchedDatasets={prefetch.targetDatasets} prefetchedCollectionsById={prefetch.targetDatasetCollectionsById}/>
                    pageType = types.TARGETDATA
                } else if(!!extraPath.includes(pagePaths[types.TARGETTOOLS])) {
                    mainContent = <TargetTools target={target}/>
                    pageType = types.TARGETTOOLS
                } else if(!!extraPath.includes(pagePaths[types.MOREDATA])) {
                    mainContent = <MoreData missions={missions} targets={[target]} context={contexts.TARGET_MORE_DATA} prefetchedDatasets={prefetch.moreDatasets} prefetchedCollectionsById={prefetch.moreDatasetCollectionsById} />
                    pageType = types.MOREDATA
                }
            } else {
                mainContent = <Target target={target}  {...otherProps} />
            }
            break;
        } 
        // main lid is for a dataset
        case types.BUNDLE: 
            mainContent = <Bundle dataset={model} context={target} prefetchedCollections={prefetch.bundleCollections} {...otherProps}/>
            pageType=types.TARGETDATA
            break
        case types.COLLECTION: 
            mainContent = <Collection dataset={model} context={target} prefetchedBundles={prefetch.collectionBundles} {...otherProps} />
            pageType=types.TARGETDATA
            break
            
    }

    return (
        <Root>
            <TargetHeader page={pageType} target={friendlyTarget || target} pdsOnly={otherProps.pdsOnly}/>
            {mainContent}
        </Root>
    )
}
