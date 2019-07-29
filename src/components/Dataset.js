import React from 'react';
import CollectionList from 'components/CollectionList.js'
import FamilyLinks from 'components/FamilyLinks.js'

export default function Dataset({dataset}) {
    const isBundle = dataset.identifier.split(':').length === 4
    return (
        <div>
            <Taxonomy dataset={dataset} />
            <FamilyLinks dataset={dataset} isBundle={isBundle}/>
            <div itemScope itemType="https://schema.org/Dataset" className={ `clearfix ${isBundle ? 'bundle-container' : 'collection-container'}`}>
                <Title dataset={dataset} />
                <DeliveryInfo dataset={dataset} />
                <Metadata dataset={dataset} isBundle={isBundle} />
                <Description dataset={dataset} />

                { isBundle && 
                    <CollectionList dataset={dataset} />
                }
                <CollectionQuickLinks dataset={dataset} />
                <CollectionDownloads dataset={dataset} />

                <Citation dataset={dataset} />
            </div>
            <div className="related-references">
                <RelatedPDS3 dataset={dataset} />
                <Superseded dataset={dataset} />
                <RelatedTools dataset={dataset} />
                <RelatedData dataset={dataset} />
            </div>
        </div>
    )
}

function Taxonomy(props) {
    const tags = props.dataset.tags
    return (
        <div id="taxonomy">
            {tags.length > 0 &&
                <h3>Relevant Tags:</h3>
            }
            {
                tags.map( tag => 
                    <div className="banner" key={tag}>
                        <a className="ignore-a-styling" href="#">
                            <span> {tag} </span>
                        </a>
                    </div>
                )
            }
        </div>
    )
}



function Title(props) {
    const title = props.dataset.display_name
    return (
        <h1 itemProp="name">
            <div className="image-container">
                <img src="/images/icn-bundle.png" />
            </div>
            <div className="resource-title">
                { title }
            </div>
        </h1>
    )
}

function DeliveryInfo(props) {
    const publication = props.dataset.publication
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
    const {isBundle, dataset} = props
    return (
        <aside>
            <section className="dataset-metadata">
                {isBundle && 
                    <h2>PDS4 Bundle</h2>
                }
                {!isBundle &&
                    <h2>PDS4 Collection</h2>
                }
                <p>Status: <br/>
                    <span className="datum">{dataset.publication.publish_status}</span>
                </p>
                {dataset.publication.publication_date &&
                    <p>Date Published: <br/><span className="datum" itemProp="datePublished" itemScope itemType="http://schema.org/Date">{dataset.publication.publication_date}</span></p>
                }
                <p>Publisher:<br/>
                    <span className="datum" itemProp="publisher" itemScope itemType="http://schema.org/Organization">NASA Planetary Data System</span>
                </p>
                {dataset.lidvid &&
                    <p>PDS4 ID: <br/><span className="datum">{dataset.lidvid}</span></p>
                }
                {dataset.doi &&
                    <p>DOI: <br/><span className="datum">{dataset.doi}</span></p>
                }
                
                {dataset.citation_author_list && 
                    <AuthorList authors={dataset.citation_author_list} />
                }
                {dataset.citation_editor_list && 
                    <EditorList editors={dataset.citation_editor_list} />
                }
                
                {/* Hidden Data Values */}
                {/* <span className="datum" itemProp="provider" style="display:none" itemScope itemType="http://schema.org/Organization">{{ data.provider.name }}</span> */}
            </section>
            <section className="dataset-links">
                {dataset.browse_url &&
                    <a href={dataset.browse_url}><img src="/images/icn-folder.png" /><span> Browse All </span></a>
                }
                {dataset.download_url &&
                    <a href={dataset.download_url}><img src="/images/icn-download.png" /><span> Download All 
                        {dataset.download_size && 
                            <span className="download-size">({ dataset.download_size })</span>
                        }
                        </span></a>
                }
                {dataset.checksum_url &&
                    <a href={dataset.checksum_url}><img src="/images/icn-checksum.png" /><span> View Checksums </span></a>
                }
            </section>
        </aside>
    )
}

function AuthorList(props) {
    const list = props.authors.split(';')
    return (
        <p>Author(s):<br/>
            {list.map(author =>  
                <div key={author} className="datum" itemProp="author" itemScope itemType="http://schema.org/Person">{ author.replace(' and ', '').trim() }</div>   
            )}
        </p>
    )
}

function EditorList(props) {
    const list = props.editors.split(';')
    return (
        <p>Editor(s):<br/>
            {list.map(editor =>  
                <div key={editor} className="datum" itemProp="author" itemScope itemType="http://schema.org/Person">{ editor.replace(' and ', '').trim() }</div>   
            )}
        </p>
    )
}

function Description(props) {
    const description = props.dataset.display_description
    return <h3 itemProp="description" className="resource-description">{ description }</h3>
}

function CollectionQuickLinks({dataset}) {
    return (
        <section className="dataset-quicklinks">
            { dataset.local_documents_url &&
                <div>
                    <h3>View Local Documents</h3>
                    <a href="{{data.localDocumentsUrl}}">
                        <img src="/images/icn-documents.png" />
                        <span>View Local Documents</span>
                    </a>
                </div>
            }
            { dataset.example && 
                <div>
                    { dataset.document_flag ?     
                        <h3>Key Document</h3> :
                        <h3>Example File</h3>
                    }
                    
                    <a href={dataset.example.url}>
                        { dataset.example.thumbnail_url ?
                            <img src={dataset.example.thumbnail_url} /> :
                            <img src="/images/icn-file.png" />
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
                        <img src="/images/icn-package.png" />
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
                            <img src="/images/icn-package.png" />
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
                <img className="start-quote" src="/images/quotes-start.png" />
                <div>
                    <p>Use the following citation to reference this data set:</p>
                    <p className="citation">"{ citation }"</p>
                </div>
                <img className="end-quote" src="/images/quotes-end.png" />
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
                <a href={pds3}><img className="tiny-icon" src="/images/icn-folder-rnd.png" />Click here to browse</a>
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
                            <a href={ref.browse_url}><img className="tiny-icon" src="/images/icn-folder-rnd.png" /></a>
                        </li>
                    )}
                </ul>
            </section>
        )
    } else return null
}

function RelatedTools(props) {
    const tools = props.dataset.related_tools
    if(tools) {
        return (
            <section className="dataset-related">
                <h3 className="header"> Related tools: </h3>
                <ul>
                    {tools.map(ref => 
                        <li key={ref.url}>
                            <a href={ref.url}>{ref.name}</a>
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