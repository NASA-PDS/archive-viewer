import { Breadcrumbs as MaterialBreadcrumbs, Link, Typography, Skeleton } from '@mui/material';
import InternalLink from 'components/InternalLink';
import LogicalIdentifier from 'services/LogicalIdentifier';
import { pagePaths, types } from 'services/pages.js';

class Breadcrumb {
    constructor(name, identifier, additionalPath) {
        this.name = name
        this.identifier = identifier
        this.additionalPath = additionalPath
    }
}

export default function Breadcrumbs({home, current, currentTitle, ancestors}) {
    if(!home || !(current || currentTitle)) {
        return <SkeletonBreadcrumbs/>
    }
    return <MaterialBreadcrumbs>
        <Link component={InternalLink} identifier={home.identifier} color="inherit">{home.display_name || home.title}</Link>
        {ancestors && ancestors.map(breadcrumb => <Link key={breadcrumb.identifier + breadcrumb.additionalPath} component={InternalLink} identifier={breadcrumb.identifier} additionalPath={breadcrumb.additionalPath} color="inherit">{breadcrumb.name}</Link>)}
        <Typography color="textPrimary" noWrap>{currentTitle || current.display_name || current.title}</Typography>
    </MaterialBreadcrumbs>
}

function InstrumentBreadcrumbs(props) {
    const { home } = props
    if(!home) {
        return <SkeletonBreadcrumbs/>
    }
    return <Breadcrumbs {...props} ancestors={[new Breadcrumb("Instruments", home.identifier, "instruments")]} />
}
    

function DatasetBreadcrumbs(props) {
    const {home, current, parent} = props
    const LID = new LogicalIdentifier(current.identifier)
    if(!props.home) {
        return <SkeletonBreadcrumbs/>
    }

    let ancestors = []
    if(LID.isBundle && LID.lid === home.mission_bundle
        || LID.isCollection && LID.parentBundle === home.mission_bundle) {
        // no intermediate breadcrumbs for mission bundles
    } else if(home.data_class === "Target") {
        ancestors.push(new Breadcrumb("Derived Data", home.identifier, pagePaths[types.TARGETDATA]))
    } else if(!!current.instrument_ref) {
        ancestors.push(new Breadcrumb("Instruments", home.identifier, pagePaths[types.MISSIONINSTRUMENTS]))
        current.instrument_ref.length === 1 &&
            ancestors.push(new Breadcrumb("Instrument", new LogicalIdentifier(current.instrument_ref[0]).lid))
    } else {
        ancestors.push(new Breadcrumb("More Data", home.identifier, pagePaths[types.MOREDATA]))
    }
    if(!!parent) {
        ancestors.push(new Breadcrumb("Bundle", parent.identifier))
    }

    return <Breadcrumbs {...props} ancestors={ancestors}/>
}

function SkeletonBreadcrumbs() {
    return <MaterialBreadcrumbs>
        <Skeleton variant="text" width={80}></Skeleton>
        <Skeleton variant="text" width={80}></Skeleton>
    </MaterialBreadcrumbs>
}
export { InstrumentBreadcrumbs, DatasetBreadcrumbs }