import React from 'react';
import {httpGet} from 'api/common.js';
import router from 'api/router.js'
import Loading from 'components/Loading'

const searchPage = 'https://pds.nasa.gov/datasearch/keyword-search/search.jsp'

export default class PDS3Results extends React.Component {

    buildParams = () => { return {
        fq: `facet_pds_model_version:"1,pds3" AND facet_type:"1,data_set"`,
        ["f.facet_pds_model_version.facet.prefix"]: '2,pds3,',
        ["f.facet_type.facet.prefix:"]: '2,data_set,'
    }}

    constructor(props) {
        super(props)
        this.state = {
            name: props.name,
            loading: true
        }
    }

    componentDidMount() {
        let params = this.buildParams()
        params.q = `"${this.state.name}"`
        params.fl = 'identifier,title,resLocation'
        params.rows = 10
        httpGet(router.datasetCore, params, true).then(response => {
            this.setState({
                docs: response.docs,
                count: response.count,
                loading: false
            })
        })
    }

    render() {
        const {docs, count, loading, name} = this.state
        if(!!loading) { return <Loading/> }
        if(!docs || count === 0) { return null }

        let params = this.buildParams()
        params.q = name
        let query = new URLSearchParams(params)
        return (
            <div className="pds3-results">
                <h2 className="header">There {count === 1 ? `is one older (PDS3) dataset` : `are ${count} older (PDS3) datasets`} available:</h2>
                <ul>
                    {docs.map(dataset => 
                        <li key={dataset.identifier}>
                            <a href={dataset.resLocation.startsWith('/') ? 'https://pds.nasa.gov' + dataset.resLocation : dataset.resLocation}>{dataset.title}</a>
                        </li>
                        )}
                </ul>
                <div className="further-results"><a href={`${searchPage}?${query.toString()}`}>View other results</a></div>
            </div>
        )
    }
}