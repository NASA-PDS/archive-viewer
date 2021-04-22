import React, {useState, useEffect} from 'react';
import {getCollectionsForDataset} from 'api/dataset.js';
import ErrorMessage from 'components/Error.js'
import {SectionedTable} from 'components/SectionedTable.js'
import { Card, Typography, CardContent, Box } from '@material-ui/core';
import { groupByLabelArray } from 'services/groupings';
import Loading from 'components/Loading.js';

export default function CollectionList({dataset}) {
    const [collections, setCollections] = useState([])
    const [loaded, setLoaded] = useState(false) 
    const [error, setError] = useState(null)

    useEffect(() => {
        getCollectionsForDataset(dataset).then(result => {
            setCollections(result)
            setLoaded(true)
        }, setError)
    }, [dataset.identifier])

    if(error) {
        return <ErrorMessage error={error} />
    } else if (!loaded) {
        return <Loading />
    }

    const collectionLids = dataset.collection_ref
    const collectionTypes = collections.map(collection => {
        const collectionIndex = collectionLids.findIndex(lid => lid.includes(collection.identifier))
        return dataset.collection_type[collectionIndex]
    })
    
    return <Box my={2}>
        <Card variant="outlined" >
            <CardContent p={1}>
            <Typography variant="h5">Data in this bundle</Typography>
            <SectionedTable groups={groupByLabelArray(collections, collectionTypes)}/>
            </CardContent>
        </Card>
    </Box>
}