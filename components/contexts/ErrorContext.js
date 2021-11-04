import { Box, Link, List, ListItem, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ErrorHeader } from 'components/ContextHeaders';
import InternalLink from 'components/InternalLink';
import PrimaryLayout from 'components/PrimaryLayout';
import React from 'react';
import LogicalIdentifier from 'services/LogicalIdentifier';
import { resolveType, types } from 'services/pages';


const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
    }
}));

export default function ErrorContext({error, lidvid, model, type, ...otherProps}) {
    const classes = useStyles()
    const errorMessage = error.message || error

    let LID, errorContent
    try {
        LID = new LogicalIdentifier(lidvid)
    } catch {
        errorContent = <InvalidLidError lidvid={lidvid}/>
    }

    if(!errorContent) {
        if(!!error.superseded) {
            errorContent = <SupersededProductError model={error.superseded} lidvid={lidvid}/>
        }
        else if(!!error.product && resolveType(error.product) === types.UNKNOWN) {
            errorContent = LID.isContextObject 
                ? <InvalidContextProductError model={error.product}/>
                : <InvalidProductError model={error.product}/>
        } else if(LID.isDataProduct) {
            errorContent = <InvalidDataProductError lidvid={lidvid}/>
        }
        else {
            errorContent = <GenericError/>
        }
    }

    return (
        <div className={classes.root}>
            <ErrorHeader/>
            <PrimaryLayout primary={<>
                <Typography variant="h2" color="error" gutterBottom>{errorMessage}</Typography>
                { errorContent }
            </>}/>
        </div>
    )
}

function InvalidLidError({lidvid}) {
    return <Box py={2}>
        <Typography variant="h4">{`'${lidvid}' doesn't look like a Logical Identifier`}</Typography>
        <p>Logical Identifiers (LIDs) look something like this: urn:nasa:pds:orex.ocams</p>
        <p>Learn more about PDS Logical Identifiers in the in <Link href="https://pds.nasa.gov/datastandards/documents/current-version.shtml">our documentation at pds.nasa.gov</Link></p>
    </Box>
}

function InvalidProductError({model}) {
    return <Box py={2}>
        <Typography variant="h4">{`'${model.title}' is a ${model.data_class || model.objectType}, which is not supported by Archive Navigator`}</Typography>
        <p>Archive Navigator can display information about these product types:
            <List>
                <ListItem><Link href="https://pds.nasa.gov/datastandards/documents/im/current/index_1F00.html#class_pds_investigation">Investigation (Mission)</Link></ListItem>
                <ListItem><Link href="https://pds.nasa.gov/datastandards/documents/im/current/index_1F00.html#class_pds_instrument_host">Instrument Host (Spacecraft)</Link></ListItem>
                <ListItem><Link href="https://pds.nasa.gov/datastandards/documents/im/current/index_1F00.html#class_pds_instrument">Instrument</Link></ListItem>
                <ListItem><Link href="https://pds.nasa.gov/datastandards/documents/im/current/index_1F00.html#class_pds_target">Target</Link></ListItem>
                <ListItem><Link href="https://pds.nasa.gov/datastandards/documents/im/current/index_1F00.html#class_pds_product_bundle">Bundle</Link></ListItem>
                <ListItem><Link href="https://pds.nasa.gov/datastandards/documents/im/current/index_1F00.html#class_pds_product_collection">Collection</Link></ListItem>
            </List>
        </p>
    </Box>
}

function InvalidContextProductError({model}) {
    return <Box py={2}>
        <Typography variant="h4">{`'${model.title}' is a ${model.data_class}, which is not supported by Archive Navigator`}</Typography>
        <p>Archive Navigator can display information about these PDS4 context product types:
            <List>
                <ListItem><Link href="https://pds.nasa.gov/datastandards/documents/im/current/index_1F00.html#class_pds_investigation">Investigation (Mission)</Link></ListItem>
                <ListItem><Link href="https://pds.nasa.gov/datastandards/documents/im/current/index_1F00.html#class_pds_instrument_host">Instrument Host (Spacecraft)</Link></ListItem>
                <ListItem><Link href="https://pds.nasa.gov/datastandards/documents/im/current/index_1F00.html#class_pds_instrument">Instrument</Link></ListItem>
                <ListItem><Link href="https://pds.nasa.gov/datastandards/documents/im/current/index_1F00.html#class_pds_target">Target</Link></ListItem>
            </List>
        </p>
    </Box>
}

function InvalidDataProductError({lidvid}) {
    let parentLid = new LogicalIdentifier(lidvid).parentCollection
    return <Box py={2}>
        <Typography variant="h4">{`'${lidvid}' appears to be a data product LID, which is not supported by Archive Navigator`}</Typography>
        <p>You can visit the collection for this product at <InternalLink identifier={parentLid} passHref><Link>{parentLid}</Link></InternalLink>  </p>
        <p>Archive Navigator can display information about these product types:
            <List>
                <ListItem><Link href="https://pds.nasa.gov/datastandards/documents/im/current/index_1F00.html#class_pds_investigation">Investigation (Mission)</Link></ListItem>
                <ListItem><Link href="https://pds.nasa.gov/datastandards/documents/im/current/index_1F00.html#class_pds_instrument_host">Instrument Host (Spacecraft)</Link></ListItem>
                <ListItem><Link href="https://pds.nasa.gov/datastandards/documents/im/current/index_1F00.html#class_pds_instrument">Instrument</Link></ListItem>
                <ListItem><Link href="https://pds.nasa.gov/datastandards/documents/im/current/index_1F00.html#class_pds_target">Target</Link></ListItem>
                <ListItem><Link href="https://pds.nasa.gov/datastandards/documents/im/current/index_1F00.html#class_pds_product_bundle">Bundle</Link></ListItem>
                <ListItem><Link href="https://pds.nasa.gov/datastandards/documents/im/current/index_1F00.html#class_pds_product_collection">Collection</Link></ListItem>
            </List>
        </p>
    </Box>
}

function SupersededProductError({model, lidvid}) {
    let baseLid = model.identifier
    let version = new LogicalIdentifier(lidvid).vid
    return <Box py={2}>
        <Typography variant="h4">{`You've requested version '${version}', which is no longer available online.`}</Typography>
        <p>You can visit the latest version ({model.version_id}) for this product at <InternalLink identifier={baseLid} passHref><Link>{baseLid}</Link></InternalLink>  </p>
        <p>If you need access to the older version of this data for replication or other purposes, <Link href={`mailto:sbn.psi.edu?subject=Dataset request: ${lidvid}`}>send us an email.</Link></p>
    </Box>
}

function GenericError() {
    return <Box py={2}>
        <Typography variant="h4">If this error persists, please let us know at <Link href="mailto:sbn.psi.edu">sbn@psi.edu</Link></Typography>
    </Box>
}