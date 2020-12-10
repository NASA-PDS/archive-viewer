import React, { useEffect, useState} from 'react';
import {pds3Get} from 'api/common.js';
import Loading from 'components/Loading'
import { Link, Button, CardActions, List, ListItem, ListItemText } from '@material-ui/core'
import TangentCard from 'components/TangentCard'

const searchPage = 'https://pds.nasa.gov/datasearch/keyword-search/search.jsp'

export default function PDS3Results(props) {
    const [docs, setDocs] = useState([])
    const [count, setCount] = useState(null) 
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        pds3Get({q: buildQuery(props)}).then(response => {
            setDocs(response.docs)
            setCount(response.count)
            setLoaded(true)
        })
    }, [props.name])

    if(!loaded) { return <Loading/> }
    if(!docs || count === 0) { return null }

    let params = buildParams()
    params.q = buildQuery(props)
    let url = `${searchPage}?${new URLSearchParams(params).toString()}`
    return <ResultsList datasets={docs} count={count} resultsUrl={url}/>
}

function ResultsList({datasets, count, resultsUrl}) {
    return (
        <TangentCard title={`There ${count === 1 ? `is one (legacy) PDS3 dataset` : `are ${count} (legacy) PDS3 datasets`} available:`}>
            <List>
                {datasets.map(dataset => 
                    <ListItem button component={Link} key={dataset.identifier} href={dataset.resLocation.startsWith('/') ? 'https://pds.nasa.gov' + dataset.resLocation : dataset.resLocation}>
                        <ListItemText primary={dataset.title} primaryTypographyProps={{color: "primary"}}/>
                    </ListItem>
                    )}
            </List>
            <CardActions><Button variant="contained" color="primary" href={resultsUrl}>View other results</Button></CardActions>
        </TangentCard>
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