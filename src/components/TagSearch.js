import React from 'react';
import ErrorMessage from 'components/Error.js'
import Loading from 'components/Loading.js'
import {lookupTags} from 'api/tags.js'
import { Link } from 'react-router-dom'

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
        const {loaded, results, error, type, tags} = this.state

        if(error) {
            return <ErrorMessage error={error}></ErrorMessage>
        } else if(!loaded) {
            return <Loading fullscreen={true}/>
        }
        results.sort((a, b) => a.display_name.localeCompare(b.display_name))
        return (
            <div>
                <h1>{tags.join(' or ')}</h1>
                <ul>
                    {results.map(result =>
                        <li key={result.logical_identifier}>
                            <Link to={`/${type}/${result.logical_identifier}`}>{result.display_name}</Link>
                        </li>
                    )}
                </ul>
            </div>
        )
        
    }
}