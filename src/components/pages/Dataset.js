import React from 'react';
import CollectionList from 'components/CollectionList.js'
import FamilyLinks from 'components/FamilyLinks.js'
import RelatedTools from 'components/RelatedTools'
import {getInstrumentsForDataset, getSpacecraftForDataset, getTargetsForDataset} from 'api/dataset.js'
import {InstrumentListBox, SpacecraftListBox, TargetListBox} from 'components/ListBox'
import {Description} from 'components/ContextObjects'
import {DatasetTagList} from 'components/TagList'

const types = {
    BUNDLE: 1,
    COLLECTION: 2,
    PDS3: 3,
}

class Dataset extends React.Component {

    constructor(props) {
        super(props)
        const {dataset} = props
        this.state = { dataset }
    }

    componentDidMount() {
        getInstrumentsForDataset(this.state.dataset).then(instruments => this.setState({instruments}))
        getSpacecraftForDataset(this.state.dataset).then(spacecraft => this.setState({spacecraft}))
        getTargetsForDataset(this.state.dataset).then(targets => this.setState({targets}))
    }   

    render() {    
        const {dataset, targets, spacecraft, instruments} = this.state
        return (
            <div>
                <FamilyLinks dataset={dataset} />
                <div itemScope itemType="https://schema.org/Dataset" className={ `clearfix ${this.type === types.BUNDLE ? 'bundle-container' : 'collection-container'}`}>
                    <Title dataset={dataset} />
                    <DeliveryInfo dataset={dataset} />
                    <Metadata dataset={dataset} type={this.type} targets={targets} spacecraft={spacecraft} instruments={instruments}/>
                    <DatasetTagList tags={dataset.tags}/>
                    <Description model={dataset} type={Description.type.dataset}/>

                    { this.type === types.BUNDLE && 
                        <CollectionList dataset={dataset} />
                    }
                    <RelatedTools tools={dataset.tools}/>
                    <CollectionQuickLinks dataset={dataset} />
                    <CollectionDownloads dataset={dataset} />

                    <Citation dataset={dataset} />
                </div>
                <div className="related-references">
                    <RelatedPDS3 dataset={dataset} />
                    <Superseded dataset={dataset} />
                    <RelatedData dataset={dataset} />
                </div>
            </div>
        )
    }
}

export class Bundle extends Dataset {
    type = types.BUNDLE
}
export class Collection extends Dataset {
    type = types.COLLECTION
}
export class PDS3Dataset extends Dataset {
    type = types.PDS3
}

function Title({dataset}) {
    const title = dataset.display_name ? dataset.display_name : dataset.title
    return (
        <h1 itemProp="name">
            <div className="image-container">
                <img alt="Bundle" src="./images/icn-bundle.png" />
            </div>
            <div className="resource-title">
                { title }
            </div>
        </h1>
    )
}

function DeliveryInfo({dataset}) {
    const publication = dataset.publication
    if(publication && publication.delivery_info) {
        return (
            <div className="dataset-delivery">
                <p>{publication.delivery_info}</p>
                <p>Latest release date: <span className="datum">{publication.publication_date}</span></p>
            </div>
        )
    } else {
        return null
    }
}

function Metadata(props) {
    const {dataset, targets, spacecraft, instruments, type} = props
    return (
        <aside className="main-aside">
            <section className="dataset-metadata">
                {(() => {switch(type) {
                    case types.BUNDLE: return <h2>PDS4 Bundle</h2>
                    case types.COLLECTION: return <h2>PDS4 Collection</h2>
                    case types.PDS3: return <h2>PDS3 Dataset</h2>
                }})()}
                {!!dataset.publication && !!dataset.publication.publish_status && (
                    <p>Status: <br/>
                        <span className="datum">{dataset.publication.publish_status}</span>
                    </p>)
                }
                {!!dataset.publication && !!dataset.publication.publication_date &&
                    <p>Date Published: <br/><span className="datum" itemProp="datePublished" itemScope itemType="http://schema.org/Date">{dataset.publication.publication_date}</span></p>
                }
                <p>Publisher:<br/>
                    <span className="datum" itemProp="publisher" itemScope itemType="http://schema.org/Organization">NASA Planetary Data System</span>
                </p>
                {dataset.identifier &&
                    <p>{type === types.PDS3 ? 'PDS3' : 'PDS4'} ID: <br/><span className="datum">{dataset.identifier}</span></p>
                }
                {dataset.doi &&
                    <p>DOI: <br/><span className="datum">{dataset.doi}</span></p>
                }
                
                <AuthorList authors={dataset.citation_author_list} />
                <EditorList editors={dataset.citation_editor_list} />
                
                {/* Hidden Data Values */}
                {/* <span className="datum" itemProp="provider" style="display:none" itemScope itemType="http://schema.org/Organization">{{ data.provider.name }}</span> */}
            </section>
            <section className="related-context-objects">
                <TargetListBox items={targets}/>
                <SpacecraftListBox items={spacecraft}/>
                <InstrumentListBox items={instruments}/>
            </section>
            <section className="dataset-links">
                <BrowseButton dataset={dataset}></BrowseButton>
                {dataset.download_url &&
                    <a href={dataset.download_url}><img alt="" src="./images/icn-download.png" /><span> Download All 
                        {dataset.download_size && 
                            <span className="adjacent-link download-size">({ dataset.download_size })</span>
                        }
                        </span></a>
                }
                {dataset.checksum_url &&
                    <a href={dataset.checksum_url}><img alt="" src="./images/icn-checksum.png" /><span> View Checksums </span></a>
                }
                {dataset.resource_url &&
                    <a href={dataset.resource_url}><img alt="" src="./images/icn-external.png" /><span> View Resource </span></a>
                }
            </section>
        </aside>
    )
}

function AuthorList({authors}) {
    const list = authors ? authors.split(';') : []
    return list.length ? (
        <ul>Author(s):<br/>
            {list.map(author =>  
                <li key={author} className="datum" itemProp="author" itemScope itemType="http://schema.org/Person">{ author.replace(' and ', '').trim() }</li>   
            )}
        </ul>
    ) : null
}

function EditorList({editors}) {
    const list = editors ? editors.split(';') : []
    return list.length ? (
        <ul>Editor(s):<br/>
            {list.map(editor =>  
                <li key={editor} className="datum" itemProp="author" itemScope itemType="http://schema.org/Person">{ editor.replace(' and ', '').trim() }</li>   
            )}
        </ul>
    ) : null
}

function BrowseButton({dataset}) {
    let url = dataset.browse_url ? dataset.browse_url : dataset.resource_url
    return <a href={url}><img alt="" src="./images/icn-folder.png" /><span> Browse All </span></a>
}

function CollectionQuickLinks({dataset}) {
    return (
        <section className="dataset-quicklinks">
            { dataset.local_documents_url &&
                <div>
                    <h3>View Local Documents</h3>
                    <a href={dataset.local_documents_url}>
                        <img alt="" src="./images/icn-documents.png" />
                        <span>View Local Documents</span>
                    </a>
                </div>
            }
            { dataset.example && 
                <div>
                    { dataset.collection_type === "Document"?     
                        <h3>Key Document</h3> :
                        <h3>Example File</h3>
                    }
                    
                    <a href={dataset.example.url}>
                        { dataset.example.thumbnail_url ?
                            <img alt={"Thumbnail for " + dataset.title} src={dataset.example.thumbnail_url} /> :
                            <img alt="Placeholder thumbnail" src="./images/icn-file.png" />
                        }
                        <span>{ dataset.example.title }</span>
                    </a>
                </div>
            }
        </section>
    )
}

function CollectionDownloads({dataset}) {
    let downloads = dataset.download_packages
    if(!!downloads) {
        return (
            <section className="dataset-downloads">
                <h3>Download packages:</h3>
                <ul>
                    <li>
                        <img alt="" src="./images/icn-package.png" />
                        <a href={dataset.download_url}> 
                            <span> Download All 
                            { dataset.download_size &&
                                <span class="download-size">({ dataset.download_size })</span> 
                            }
                            </span>
                        </a>
                    </li>
                    { dataset.download_packages.map(pkg => (
                        <li key={pkg.download_url}>
                            <img alt="" src="./images/icn-package.png" />
                            <a href={pkg.download_url}>
                                <span> { pkg.name } 
                                { pkg.download_size &&
                                    <span class="download-size">({ pkg.download_size })</span> 
                                }
                                </span>
                            </a>
                        </li>
                    ))}
                </ul>
            </section>
        )
    } else { return null }
}

function Citation(props) {
    const citation = props.dataset.citation
    if(citation) {
        return (
            <section className="dataset-citation">
                <img alt="" className="start-quote" src="./images/quotes-start.png" />
                <div>
                    <p>Use the following citation to reference this data set:</p>
                    <p className="citation">"{ citation }"</p>
                </div>
                <img alt="" className="end-quote" src="./images/quotes-end.png" />
            </section>
        )
    } else return null
}

function RelatedPDS3(props) {
    const pds3 = props.dataset.pds3_version_url
    if(pds3) {
        return (
            <section className="dataset-pds3">
                <h3 className="header"> PDS3 versions of this dataset: </h3>
                <a href={pds3}><img alt="" className="tiny-icon" src="./images/icn-folder-rnd.png" />Click here to browse</a>
            </section>
        )
    } else return null
}

function Superseded(props) {
    const superseded = props.dataset.superseded_data
    if(superseded) {
        return (
            <section className="dataset-superseded">
                <h3 className="header"> Superseded versions of this data set: </h3>
                <ul>
                    {superseded.map(ref => 
                        <li key={ref.browse_url}>
                            {ref.name}
                            <a href={ref.browse_url}><img alt="" className="tiny-icon" src="./images/icn-folder-rnd.png" /></a>
                        </li>
                    )}
                </ul>
            </section>
        )
    } else return null
}

function RelatedData(props) {
    const data = props.dataset.related_data
    if(data) {
        return (
            <section className="dataset-related">
                <h3 className="header"> Related data: </h3>
                <ul>
                    {data.map(ref => 
                        <li key={ref.lid}>
                            <a href={'?dataset=' + ref.lid}>{ref.name}</a>
                        </li>
                    )}
                </ul>
            </section>
        )
    } else return null
}