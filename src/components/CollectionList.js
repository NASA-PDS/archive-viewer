import React from 'react';
import {getCollectionsForDataset} from 'api/dataset.js';
import ErrorMessage from 'components/Error.js'
import Loading from 'components/Loading'

export default class Main extends React.Component {
    constructor(props) {
        super(props)
        const dataset = props.dataset
        this.state = {
            loaded: false,
            dataset: dataset,
            collections: dataset.collection_ref.map(ref => { return { lid: ref } })
        }
    }

    componentDidMount() {
        getCollectionsForDataset(this.state.dataset).then(result => {
            this.setState({
                collections: result,
                loaded: true
            })
        })
    }

    render() {
        const { error, collections, loaded } = this.state
        if(error) {
            return <ErrorMessage error={error} />
        } else
        return <CollectionList collections={collections} loaded={loaded} />
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
        let sortedCollections = collections.sort((a, b) => {
            if (a.collection_type === "Document") { return -1}
            if (b.collection_type === "Document") { return 1 }
            return 0
        })
        collectionElements = sortedCollections.map(collection =>
            <div key={collection.identifier} className="collection collection-container">
                <div className="header">
                    <a href={'?dataset=' + collection.identifier}>
                        <span className="collection-title" title="Collection Title">{collection.display_name ? collection.display_name : collection.title}</span>
                    </a>

                    {collection.example && (
                        <span className="example">
                            {collection.collection_type === "Document" ? 
                                <span className="file-label">Key Document: </span> : 
                                <span className="file-label">Example File: </span>
                            }
                            <a href={collection.example.url}>{collection.example.title ? collection.example.title : collection.example.filename}</a>
                        </span>
                    )}
                </div>
                <div className="actions">
                    {collection.download_url && (
                        <a href={collection.download_url}>
                            <img src="./images/icn-download-rnd.png"/> 
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