import React from 'react';
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

export default class TagSearch extends React.Component {
    constructor(props) {
        super(props)

        this.state = { 
            loaded: false
        }

    }
    
    componentDidMount() {
        const {tags, type} = this.props

        // validate input
        if(!Object.values(TagTypes).includes(type)) {
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
        const {loaded, results, error} = this.state
        const {tags, type, embedded} = this.props

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
}