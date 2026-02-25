import React, {useState, useEffect} from 'react';
import ErrorMessage from 'components/Error.js'
import {SectionedTable} from 'components/SectionedTable.js'
import { Card, Typography, CardContent, Box } from '@mui/material';
import { groupByLabelArray } from 'services/groupings';
import Loading from 'components/Loading.js';
import { HiddenMicrodataObject, HiddenMicrodataValue } from 'components/pages/Dataset'
import { getCollectionsForDataset } from 'api/dataset';
import { logPrefetchFallback } from 'services/prefetchFallbackLog';

const typeOrder = [
    "Data",
    "Document",
    "Browse",
    "Geometry",
    "SPICE Kernel",
    "Calibration",
    "Context",
    "XML Schema",
    "Miscellaneous",
]

const purposeOrder = [
    "SCIENCE",
    "SUPPORTING OBSERVATION",
    "OBSERVATION GEOMETRY",
    "CALIBRATION",
    "NAVIGATION",
    "ENGINEERING",
    "CHECKOUT",
]

export default function CollectionList({dataset, prefetchedCollections}) {
    const [collections, setCollections] = useState(prefetchedCollections || [])
    const [loaded, setLoaded] = useState(!!prefetchedCollections) 
    const [error, setError] = useState(null)

    useEffect(() => {
        if(prefetchedCollections) {
            setCollections(prefetchedCollections)
            setLoaded(true)
        }
        else {
            setLoaded(false)
            logPrefetchFallback('CollectionList:getCollectionsForDataset', { identifier: dataset?.identifier || null })
            getCollectionsForDataset(dataset).then(result => {
                setCollections(result)
                setLoaded(true)
            }, err => {
                setError(err)
                setLoaded(true)
            })
        }
    }, [dataset.identifier, prefetchedCollections])

    if(error) {
        return <ErrorMessage error={error} />
    } else if (!loaded) {
        return <Loading />
    }

    const collectionLids = dataset.collection_ref
    const collectionTypes = collections.map(collection => {
        const collectionIndex = collectionLids.findIndex(lid => lid.includes(collection.identifier))
        if(!!dataset.collection_type)
            return dataset.collection_type[collectionIndex]
        return collection.collection_type
    })
    
    return <Box my={2}>
        <Card variant="outlined" >
            <CardContent p={1}>
            <Typography variant="h5">Data in this bundle</Typography>
            <SectionedTable groups={groupByLabelArray(collections, collectionTypes, typeOrder)} separateBy="primary_result_purpose" orderBy={purposeOrder}/>
            </CardContent>
        </Card>
        {collections.map(collection =>
            <HiddenMicrodataObject itemProp="dataset" type="https://schema.org/Dataset" key={collection.identifier}>
                <HiddenMicrodataValue itemProp="name" value={collection.title}/>
                <HiddenMicrodataValue itemProp="identifier" value={collection.identifier}/>
                <HiddenMicrodataValue itemProp="url" value={"https://arcnav.psi.edu/" + collection.identifier}/>
                <HiddenMicrodataValue itemProp="description" value={collection.description || collection.title}/>
            </HiddenMicrodataObject>
            )}
    </Box>
}
