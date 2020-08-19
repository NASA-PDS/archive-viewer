import React from 'react';
import {pds3Get} from 'api/common.js';
import Loading from 'components/Loading'
import { Card, Link, Button, CardHeader, CardActions, List, ListItem, ListItemText } from '@material-ui/core'

const searchPage = 'https://pds.nasa.gov/datasearch/keyword-search/search.jsp'

export default class PDS3Results extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            loading: true
        }
    }

    componentDidMount() {
        pds3Get({q: buildQuery(this.props)}).then(response => {
            this.setState({
                docs: response.docs,
                count: response.count,
                loading: false
            })
        })
    }

    render() {
        const {docs, count, loading} = this.state
        if(!!loading) { return <Loading/> }
        if(!docs || count === 0) { return null }

        let params = buildParams()
        params.q = buildQuery(this.props)
        let url = `${searchPage}?${new URLSearchParams(params).toString()}`
        return <ResultsList datasets={docs} count={count} resultsUrl={url}/>
    }
}

function ResultsList({datasets, count, resultsUrl}) {
    return (
        <Card raised={3} p={1}>
            <CardHeader title={`There ${count === 1 ? `is one (legacy) PDS3 dataset` : `are ${count} (legacy) PDS3 datasets`} available:`}/>
            <List>
                {datasets.map(dataset => 
                    <ListItem button component={Link} key={dataset.identifier} href={dataset.resLocation.startsWith('/') ? 'https://pds.nasa.gov' + dataset.resLocation : dataset.resLocation}>
                        <ListItemText primary={dataset.title}/>
                    </ListItem>
                    )}
            </List>
            <CardActions><Button variant="contained" color="primary" href={resultsUrl}>View other results</Button></CardActions>
        </Card>
    )
}

function buildParams() { return {
    fq: `facet_pds_model_version:"1,pds3" AND facet_type:"1,data_set"`,
    "f.facet_pds_model_version.facet.prefix": '2,pds3,',
    "f.facet_type.facet.prefix:": '2,data_set,'
}}

function buildQuery(props) {
    let queries = []
    const {name, hostId, instrumentId } = props

    if(!hostId && !instrumentId) {
        queries = [`"${name}"`]
    } else {
        if(!!hostId) {
            queries.push(`instrument_host_id:${hostId}`) 
        } 
        if(!!instrumentId) {
            queries.push(`instrument_id:${instrumentId}`)
        } 
    }
    return queries.join(" AND ")
}