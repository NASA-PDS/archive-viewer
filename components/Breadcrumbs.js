import { Breadcrumbs as MaterialBreadcrumbs, Link, Typography } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import InternalLink from 'components/InternalLink';
import LogicalIdentifier from 'services/LogicalIdentifier';

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
        <InternalLink identifier={home.identifier} passHref><Link color="inherit">{home.display_name || home.title}</Link></InternalLink>
        {ancestors && ancestors.map(breadcrumb => <InternalLink identifier={breadcrumb.identifier} additionalPath={breadcrumb.additionalPath} passHref><Link color="inherit">{breadcrumb.name}</Link></InternalLink>)}
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
        ancestors.push(new Breadcrumb("Derived Data", home.identifier, "data"))
    } else if(!!current.instrument_ref) {
        ancestors.push(new Breadcrumb("Instruments", home.identifier, "instruments"))
        current.instrument_ref.length === 1 &&
            ancestors.push(new Breadcrumb("Instrument", current.instrument_ref[0]))
    } else {
        ancestors.push(new Breadcrumb("Other Data", home.identifier, "other"))
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