import { Breadcrumbs as MaterialBreadcrumbs, Link, Typography } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import InternalLink from 'components/InternalLink';

export default function Breadcrumbs({home, current, currentTitle, subsectionLink}) {
    if(!home || !(current || currentTitle)) {
        return <SkeletonBreadcrumbs/>
    }
    return <MaterialBreadcrumbs>
        <InternalLink identifier={home.identifier} passHref><Link color="inherit">{home.display_name || home.title}</Link></InternalLink>
        {subsectionLink}
        <Typography color="textPrimary" noWrap>{currentTitle || current.display_name || current.title}</Typography>
    </MaterialBreadcrumbs>
}

function InstrumentBreadcrumbs(props) {
    if(!props.home) {
        return <SkeletonBreadcrumbs/>
    }
    return <Breadcrumbs {...props} subsectionLink={
        <InternalLink identifier={props.home.identifier} additionalPath="instruments" passHref><Link color="inherit">Instruments</Link></InternalLink>
    }/>
}

function DatasetBreadcrumbs(props) {
    const {home, current} = props
    if(!props.home) {
        return <SkeletonBreadcrumbs/>
    }

    let subsection
    if(home.mission_bundle === current.identifier) {
        subsection = null
    } else if(home.data_class === "Target") {
        subsection = <InternalLink identifier={home.identifier} additionalPath="data" passHref><Link color="inherit">Derived Data</Link></InternalLink>
    } else if(!!current.instrument_ref) {
        subsection = current.instrument_ref.length === 1
            ? <InternalLink identifier={current.instrument_ref[0]} passHref><Link color="inherit">Instrument</Link></InternalLink> 
            : <InternalLink identifier={home.identifier} additionalPath="instruments" passHref><Link color="inherit">Instruments</Link></InternalLink>
    }

    return <Breadcrumbs {...props} subsectionLink={subsection}/>
}

function SkeletonBreadcrumbs() {
    return <MaterialBreadcrumbs>
        <Skeleton variant="text" width={80}></Skeleton>
        <Skeleton variant="text" width={80}></Skeleton>
    </MaterialBreadcrumbs>
}
export { InstrumentBreadcrumbs, DatasetBreadcrumbs }