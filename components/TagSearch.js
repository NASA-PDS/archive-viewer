import React, { useState, useEffect } from 'react';
import ErrorMessage from 'components/Error.js'
import Loading from 'components/Loading.js'
import {lookupTags} from 'api/tags.js'
import { ContextList } from 'components/ContextLinks'
import { Typography, Container,  } from '@material-ui/core';

export const TagTypes = {
    target: 'Targets',
    mission: 'Missions',
    spacecraft: 'Spacecraft',
    instrument: 'Instrument',
    dataset: 'Dataset',
}

export default function TagSearch({tags, type, embedded}) {
    const [results, setResults] = useState([])
    const [loaded, setLoaded] = useState(false) 
    const [error, setError] = useState(null)

    if(!Object.values(TagTypes).includes(type)) {
        return <ErrorMessage error={error}></ErrorMessage>
    }

    useEffect(() => {
        lookupTags(tags, type).then(result => {
            setResults(result)
            setLoaded(true)
        }, setError)
    }, [tags, type])

    if(error) {
        return <ErrorMessage error={error}></ErrorMessage>
    } else if(!loaded) {
        return <Loading fullscreen={true}/>
    }
    results.sort((a, b) => a.display_name.localeCompare(b.display_name))
    return (
        <Container>
            {!embedded && <Typography variant="h1">{type} tagged with {tags.join(' or ')}</Typography>}
            <ContextList items={results}/>
        </Container>
    )
}