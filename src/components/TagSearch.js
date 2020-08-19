import React from 'react';
import ErrorMessage from 'components/Error.js'
import Loading from 'components/Loading.js'
import {lookupTags} from 'api/tags.js'
import { ContextList } from 'components/ContextLinks'
import { Typography, Container, Paper } from '@material-ui/core';

export const TagTypes = {
    target: 'target',
    mission: 'mission',
    spacecraft: 'spacecraft',
    instrument: 'instrument',
    dataset: 'dataset',
}

export default class TagSearch extends React.Component {
    constructor(props) {
        super(props)
        const {tags, type} = props

        this.state = { 
            loaded: false,
            tags: tags,
            type
        }

    }
    
    componentDidMount() {
        const {tags, type} = this.state

        // validate input
        if(!TagTypes[type]) {
            this.setState({
                error: new Error('Invalid tag type ' + type)
            })
        } else {
            lookupTags(tags, type).then(result => {
                this.setState({
                    results: result,
                    loaded: true
                })
            }, error => 
            this.setState({ error }))
        }
    }
    
    render() {
        const {loaded, results, error, tags} = this.state

        if(error) {
            return <ErrorMessage error={error}></ErrorMessage>
        } else if(!loaded) {
            return <Loading fullscreen={true}/>
        }
        results.sort((a, b) => a.display_name.localeCompare(b.display_name))
        return (
            <Container component={Paper}>
                <Typography variant="h1">{tags.join(' or ')}</Typography>
                <ContextList items={results}/>
            </Container>
        )
        
    }
}