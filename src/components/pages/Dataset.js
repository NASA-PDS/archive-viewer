import React from 'react';
import CollectionList from 'components/CollectionList.js'
import FamilyLinks from 'components/FamilyLinks.js'
import RelatedTools from 'components/RelatedTools'
import {getInstrumentsForDataset, getSpacecraftForDataset, getTargetsForDataset} from 'api/dataset.js'
import {InstrumentListBox, SpacecraftListBox, TargetListBox} from 'components/ListBox'
import {DatasetDescription} from 'components/ContextObjects'
import {DatasetTagList} from 'components/TagList'
import { Avatar, ListItemAvatar, Link, Grid, Card, CardMedia, CardContent, Button, List, ListItem, ListItemText, Typography, Paper, Box } from '@material-ui/core'
import TangentCard from 'components/TangentCard';
import { makeStyles } from '@material-ui/core/styles';
import PrimaryContent from 'components/PrimaryContent';
import PrimaryLayout from 'components/PrimaryLayout'

const useStyles = makeStyles((theme) => ({
    citation: {
        padding: theme.spacing(2),
        color: theme.palette.secondary.dark
    },
    citationIcon: {
        maxHeight: '50px',
        maxWidth: '50px',
    },
    citationEnd: {
        alignSelf: 'flex-end'
    },
    quickLink: {
        maxWidth: 200
    },
    primaryButton: {
        width: '100%'
    },
    datasetIcon: {
        maxHeight: '50px',
        maxWidth: '50px',
        marginRight: theme.spacing(2)
    },
    textListItem: {
        paddingTop: 0,
        paddingBottom: 0
    },
    deliveryInfo: {
        backgroundColor: theme.palette.primary.light,
        padding: '15px',
        color: theme.palette.common.white,
        textAlign: 'center'
    },
    buttonIcon: {
        maxHeight: '25px'
    }
}));

const types = {
    BUNDLE: 1,
    COLLECTION: 2,
    PDS3: 3,
}

const titles = {
    [types.BUNDLE]: "PDS4 Bundle",
    [types.COLLECTION]: "PDS4 Collection",
    [types.PDS3]: "PDS3 Dataset"
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
            <>
                <PrimaryLayout itemScope itemType="https://schema.org/Dataset" className={ `${this.type === types.BUNDLE ? 'bundle-container' : 'collection-container'}`} primary={
                    <>
                    <Title dataset={dataset} type={this.type} />
                    <DeliveryInfo dataset={dataset} />
                    <TangentCard title={titles[this.type]}>
                        {!!dataset.publication && !!dataset.publication.publish_status && (
                            <MetadataList header="Status:" items={[dataset.publication.publish_status]} />)
                        }
                        {!!dataset.publication && !!dataset.publication.publication_date &&
                            <MetadataList header="Date Published:" items={[dataset.publication.publication_date]} itemProp="datePublished" itemScope itemType="http://schema.org/Date"/>
                        }
                        <MetadataList header="Publisher:" items={["NASA Planetary Data System"]} itemProp="publisher" itemScope itemType="http://schema.org/Organization"/>
                        {dataset.identifier &&
                            <MetadataList header={`${this.type === types.PDS3 ? 'PDS3' : 'PDS4'} ID:`} items={[dataset.identifier]} />
                        }
                        {dataset.doi &&
                            <MetadataList header="DOI:" items={[dataset.doi]} />
                        }
                        
                        <AuthorList authors={dataset.citation_author_list} />
                        <EditorList editors={dataset.citation_editor_list} />
                    </TangentCard>
                    <DatasetTagList tags={dataset.tags}/>
                    <DatasetDescription model={dataset}/>

                    { this.type === types.BUNDLE && 
                        <CollectionList dataset={dataset} />
                    }
                    <RelatedTools tools={dataset.tools}/>
                    <CollectionQuickLinks dataset={dataset} />
                    <CollectionDownloads dataset={dataset} />

                    <Citation dataset={dataset} />
                    <Grid container direction="row" alignItems="stretch">
                        <Grid item component={RelatedPDS3} dataset={dataset} />
                        <Grid item component={Superseded} dataset={dataset} />
                        <Grid item component={RelatedData} dataset={dataset} />
                    </Grid>
                    </>
                } secondary={
                    <>
                        <FamilyLinks dataset={dataset} />
                        <TangentCard>
                            <Grid container direction="column" spacing={2} justify="center" alignItems="stretch">
                                <Grid item>
                                    <ActionButton url={dataset.browse_url ? dataset.browse_url : dataset.resource_url} icon={<iActionButtonIcon src="./images/icn-folder.png" />} title="Browse All"/>
                                </Grid>
                                {dataset.download_url &&
                                    <Grid item><ActionButton url={dataset.download_url} icon={<ActionButtonIcon src="./images/icn-download.png" />} title={`Download All ${dataset.download_size && ('(' + dataset.download_size + ')')}` }/></Grid>
                                }
                                {dataset.checksum_url &&
                                    <Grid item><ActionButton url={dataset.checksum_url} icon={<ActionButtonIcon src="./images/icn-checksum.png" />} title="View Checksums"/></Grid>
                                }
                                {dataset.resource_url &&
                                    <Grid item><ActionButton url={dataset.resource_url} icon={<ActionButtonIcon src="./images/icn-external.png" />} title="View Resource"/></Grid>
                                }
                            </Grid>
                        </TangentCard>
                        <TangentCard>
                            <TargetListBox items={targets}/>
                            <SpacecraftListBox items={spacecraft}/>
                            <InstrumentListBox items={instruments}/>
                        </TangentCard>
                    </>
                }/>
                {/* <Grid itemScope itemType="https://schema.org/Dataset" className={ `${this.type === types.BUNDLE ? 'bundle-container' : 'collection-container'}`}>
                    
                </Grid> */}
                
            </>
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

function Title({dataset, type}) {
    const classes = useStyles()
    const title = dataset.display_name ? dataset.display_name : dataset.title
    return (
        <Box display="flex" alignItems="center" m={1}>
            <Box >
                { type === types.COLLECTION ? 
                    <img className={classes.datasetIcon} alt="Collection" src="./images/icn-collection.png" /> : 
                    <img className={classes.datasetIcon} alt="Bundle" src="./images/icn-bundle.png" />
                }
            </Box>
            <Typography variant="h1">
                { title }
            </Typography>
        </Box>
    )
}

function DeliveryInfo({dataset}) {
    const classes = useStyles()
    const publication = dataset.publication
    if(publication && publication.delivery_info) {
        return (
            <Paper className={classes.deliveryInfo}>
                <Typography>{publication.delivery_info}</Typography>
                <Typography>Latest release date: {publication.publication_date}</Typography>
            </Paper>
        )
    } else {
        return null
    }
}

function Metadata(props) {
    const classes = useStyles()
    const {dataset, targets, spacecraft, instruments, type} = props
    return (
        <aside className="main-aside">
            
            
        </aside>
    )
}

function ActionButton({url, icon, title}) {
    const classes = useStyles()
    return <Button color="primary" variant="contained" href={url} className={classes.primaryButton} startIcon={icon}>{title}</Button>
}

function ActionButtonIcon({src}) {
    const classes = useStyles()
    return <img alt="" className={classes.buttonIcon} src={src} />
}

function AuthorList({authors}) {
    const list = authors ? authors.split(';').map(editor => editor.replace(' and ', '').trim()) : []
    return list.length ? (
        <MetadataList header={`Author${list.length > 1 ? 's:' : ':'}`} items={list} itemProp="author" itemScope itemType="http://schema.org/Person" />
    ) : null
}

function EditorList({editors}) {
    const list = editors ? editors.split(';').map(editor => editor.replace(' and ', '').trim()) : []
    return list.length ? (
        <MetadataList header={`Editor${list.length > 1 ? 's:' : ':'}`} items={list} itemProp="author" itemScope itemType="http://schema.org/Person" />
    ) : null
}

// Matierial UI List without padding
function MetadataList(props) {
    const { items, header, ...otherProps } = props
    const classes = useStyles()
    return (<>
        <Typography variant="h6">{header}</Typography>
        <List disablePadding>
            {items.map(item =>  
                <ListItem className={classes.textListItem} {...otherProps} key={item}>
                    <ListItemText primary={item}/>
                </ListItem>
            )}
        </List>
    </>)
}

function CollectionQuickLinks({dataset}) {
    const classes = useStyles()
    return (
        <PrimaryContent>
            <Grid container spacing={2} direction="row" justify="flex-start" alignItems="stretch">
                { dataset.local_documents_url &&
                    <Grid item xs={6} md={2} >
                        <Link href={dataset.local_documents_url} >
                            <Card raised={true} className={classes.quickLink} p={1}>
                                <CardMedia component="img" image="./images/icn-documents.png" alt={'Icon for documents'} title={'View Local Documents'}/>
                                <CardContent p="1">
                                    <Typography p="3" variant="h5" component="h2">View Local Documents</Typography>
                                </CardContent>
                            </Card>
                        </Link>
                    </Grid>
                }
                { dataset.example &&
                    <Grid item xs={6} md={2} >
                        <Link href={dataset.example.url} >
                            <Card raised={true} className={classes.quickLink} p={1}>
                                <CardMedia component="img" image={
                                    dataset.example.thumbnail_url ?
                                        dataset.example.thumbnail_url :
                                        './images/icn-file.png'
                                } alt={'Icon for documents'} title={'Example file'}/>
                                <CardContent p="1">
                                    <Typography p="3" variant="h5" component="h2">{ dataset.collection_type === "Document"?     
                                        'Key Document' :
                                        'Example File'
                                    }</Typography>
                                    <Typography variant="body2" color="textSecondary" component="p">{dataset.example.title}</Typography>
                                </CardContent>
                            </Card>
                        </Link>
                    </Grid>
                }
            </Grid>
        </PrimaryContent>
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
    const classes = useStyles()
    if(citation) {
        return (
            <PrimaryContent>
                <Grid container direction="row" alignItems="flex-start">
                    <Grid item component="img" alt="" className={classes.citationIcon} src="./images/quotes-start.png" />
                    <Grid item xs={6} className={classes.citation}>
                        <Typography variant="body2">Use the following citation to reference this data set:</Typography>
                        <Typography>"{citation}"</Typography>
                    </Grid>
                    <Grid item component="img" alt="" className={`${classes.citationIcon} ${classes.citationEnd}`} src="./images/quotes-end.png" />
                </Grid>
            </PrimaryContent>
        )
    } else return null
}

function RelatedPDS3(props) {
    const pds3 = props.dataset.pds3_version_url
    if(pds3) {
        return (
            <TangentCard title="PDS3 versions of this dataset:">
                <List>
                    <ListItem button component={Link} href={pds3}>
                        <ListItemAvatar>
                            <Avatar variant="square" alt="Folder Icon" src="/images/icn-folder-rnd.png" />
                        </ListItemAvatar>
                        <ListItemText primary="Click here to browse"/>
                    </ListItem>
                </List>
            </TangentCard>
        )
    } else return null
}

function Superseded(props) {
    const superseded = props.dataset.superseded_data
    if(superseded) {
        return (
            <TangentCard title="Superseded versions of this data set:">
                <List>
                    {superseded.map(ref => 
                        <ListItem button component={Link} key={ref.browse_url} href={ref.browse_url}>
                            <ListItemAvatar>
                                <Avatar variant="square" alt="Folder Icon" src="/images/icn-folder-rnd.png" />
                            </ListItemAvatar>
                            <ListItemText primary={ref.name}/>
                        </ListItem>
                        )}
                </List>
            </TangentCard>
        )
    } else return null
}

function RelatedData(props) {
    const data = props.dataset.related_data
    if(data) {
        return (
            <TangentCard title="Related data:">
                <List>
                    {data.map(ref => 
                        <ListItem button component={Link} key={ref.lid} href={'?dataset=' + ref.lid}>
                            <ListItemText primary={ref.name}/>
                        </ListItem>
                        )}
                </List>
            </TangentCard>
        )
    } else return null
}