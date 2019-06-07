import React from 'react';
import {getCollections} from 'api.js';

export default class Main extends React.Component {
    constructor(props) {
        super(props)
        const dataset = props.dataset
        this.state = {
            loaded: false,
            lids: dataset.collection_ref,
            collections: dataset.collection_ref.map(ref => { return { lid: ref } })
        }
    }

    componentDidMount() {
        getCollections(this.state.lids).then(result => {
            if( result.length === this.state.collections.length) {
                this.setState({
                    collections: result,
                    loaded: true
                })
                // FIXME: zero datasets returned
            } else {
                this.setState({
                    error: { message: 'Could not find specified webui'}
                })
            }
        })
    }

    render() {
        const { error, collections, loaded } = this.state
        if(error) {
            return <div className="error">Error: { error.message }</div>
        } else {
            return <CollectionList collections={collections} loaded={loaded} />
        }
    }
}




function CollectionList({ collections, loaded }) {
    let collectionElements
    if(!loaded) {
        collectionElements = collections.map(collection =>
            <div key={collection.lid} className="collection collection-container">
                <div className="header">
                    <a href={'?dataset=' + collection.lid}>
                        {collection.lid}
                    </a>
                </div>
            </div>
        )
    } else {
        collectionElements = collections.map(collection =>
            <div key={collection.logical_identifier} className="collection collection-container">
                <div className="header">
                    <a href={'?dataset=' + collection.logical_identifier}>
                        <span className="collection-title" title="Collection Title">{collection.display_name}</span>

                        {collection.example && (
                            <span className="example">
                                {collection.document_flag ? 
                                    <span className="file-label">Key Document:</span> : 
                                    <span className="file-label">Example File:</span>
                                }
                                <a href={collection.example.url}>{collection.example.title}</a>
                            </span>
                        )}
                    </a>
                </div>
                <div className="actions">
                    {collection.download_url && (
                        <a href={collection.download_url}>
                            <img src="/images/icn-download-rnd.png"/> 
                            {collection.download_size && ( 
                                <span className="download-size">({collection.download_size})</span> 
                            )}
                        </a>
                    )}
                </div>
            </div>
        )
    }

    return (
        <section className="dataset-collections">
            <div className="header">
                <div>
                    <span className="type-title">In this dataset...</span>
                </div>
            </div>
            <div>
                {collectionElements}
            </div>

        </section>
    )
}