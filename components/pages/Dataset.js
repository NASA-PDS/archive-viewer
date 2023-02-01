import { Box, Button, Card, CardContent, CardMedia, Chip, Grid, Link, List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { Description, FolderOutlined, GetApp, OpenInNew, UnarchiveOutlined } from '@mui/icons-material';
import { getBundlesForCollection } from 'api/dataset';
import { DatasetBreadcrumbs } from 'components/Breadcrumbs';
import CollectionNavLinks from 'components/CollectionNavLinks';
import CollectionList from 'components/CollectionList.js';
import HTMLBox from 'components/HTMLBox';
import InternalLink from 'components/InternalLink';
import { Metadata, MetadataItem } from 'components/Metadata';
import PrimaryContent from 'components/PrimaryContent';
import PrimaryLayout from 'components/PrimaryLayout';
import RelatedTools from 'components/RelatedTools';
import { LabeledListItem } from 'components/SplitListItem';
import { TagTypes } from 'components/TagSearch.js';
import TangentAccordion from 'components/TangentAccordion';
import ActionButton from 'components/ActionButton';
import React, { useEffect, useState } from 'react';

const useStyles = makeStyles((theme) => ({
    mainTitle: {
        marginTop: 0
    },
    quickLink: {
        maxWidth: 200
    },
    primaryButton: {
        width: '100%'
    },
    [theme.breakpoints.up('xs')]: {
        datasetIcon: {
            display: 'none'
        },
        datasetButton: {
            height: '80px', 
        }
    },
    [theme.breakpoints.up('sm')]: {
        datasetIcon: {
            display: 'block',
            height: '50px',
            width: '50px',
            marginRight: theme.spacing(2)
        },
        datasetButton: {
            height: '100px', 
        }
    },
    textListItem: {
        paddingTop: 0,
        paddingBottom: 0
    },
    deliveryInfo: {
        backgroundColor: theme.palette.secondary.main,
        padding: '15px',
        color: theme.palette.getContrastText(theme.palette.secondary.main),
        textAlign: 'center'
    },
    buttonIcon: {
        maxHeight: '25px'
    },
    metadataLabel: {
        width: '200px'
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

function Dataset({dataset, mockup, context, pdsOnly, type}) {
    
    const [bundles, setBundles] = useState([])

    useEffect(() => {
        type === types.COLLECTION && getBundlesForCollection(dataset).then(result => {
            setBundles(result)
        }, console.error)
    }, [dataset.identifier])

    return (
        <PrimaryLayout itemScope itemType={type === types.BUNDLE ? "https://schema.org/DataCatalog" : "https://schema.org/Dataset" } primary={
            <>
            <DatasetBreadcrumbs home={context} current={dataset} parent={bundles.length === 1 ? bundles[0] : null}/>
            <Title dataset={dataset} type={type} />
            <HTMLBox markup={dataset.html1}/>
            {/* <DeliveryInfo dataset={dataset} /> Disabled for now */}
            <RelatedTools tools={dataset.tools} noImages={!!mockup}/>

            <Metadata model={dataset} tagType={TagTypes.dataset}/>
            { type === types.COLLECTION && 
                <CollectionNavLinks dataset={dataset} bundles={bundles}/>
            }
            
            <DatasetInfo dataset={dataset} bundles={bundles}/>
            <Downloads dataset={dataset}/>
            <BrowseLink dataset={dataset} type={type}/>

            { type === types.BUNDLE && 
                <CollectionList dataset={dataset} />
            }
            { type === types.COLLECTION && 
            <>
                <CollectionExample dataset={dataset} type={type}/>
                {/* <CollectionDownloads dataset={dataset} />  Disabled for now */}
            </>
            }

            <HTMLBox markup={dataset.html2}/>

            <ReleaseInfo/>

            <MoreInformation dataset={dataset} />
            
            { dataset.citation && <TangentAccordion title="Citation">
                {/* { !!dataset.citation ? */}
                    <Citation citation={dataset.citation}/>
                    {/* : <CitationBuilder dataset={dataset} />    // Don't actually use the citation builder until we actually build it right
                } */}
            </TangentAccordion> }

            <HiddenMicrodataObject type="https://schema.org/Organization" itemProp="publisher">
                <HiddenMicrodataValue itemProp="name" value="NASA Planetary Data System"/>
                <HiddenMicrodataValue itemProp="url" value="https://pds.nasa.gov/"/>
            </HiddenMicrodataObject>
            <HiddenMicrodataValue itemProp="isAccessibleForFree" value="true"/>
            <HiddenMicrodataValue itemProp="license" value="https://creativecommons.org/publicdomain/zero/1.0/"/>
            </>
        // } secondary={         Disabled for now 
        //     <Box p={1}>      
        //         <RelatedData dataset={dataset}/>
        //         <Superseded dataset={dataset}/>
        //         <RelatedPDS3 dataset={dataset}/>
        //         <LegacyDOIs dataset={dataset}/>                        
        //     </Box>
        }/>
    )
}

export function Bundle({...props}) {
    return <Dataset type={types.BUNDLE} {...props} />
}
export function Collection({...props}) {
    return <Dataset type={types.COLLECTION} {...props} />
}
export function PDS3Dataset({...props}) {
    return <Dataset type={types.PDS3} {...props} />
}

function Title({dataset, type}) {
    const classes = useStyles()
    const title = dataset.display_name ? dataset.display_name : dataset.title
    return <>
        <Box display="flex" alignItems="top" my={3}>
            <Box >
                { type === types.COLLECTION ? 
                    <FolderOutlined className={classes.datasetIcon}/> : 
                    <UnarchiveOutlined className={classes.datasetIcon}/>
                }
            </Box>
            <Typography variant="h1" className={classes.mainTitle}>
                {title}
                <Chip color="primary" variant="outlined" label={
                    <Typography variant="body2">{titles[type]}</Typography>
                    } style={{marginLeft: '10px'}}/>
            </Typography>
            <HiddenMicrodataValue value={dataset.title} itemProp="name"/>
            { dataset.display_name && <HiddenMicrodataValue value={dataset.display_name} itemProp="alternateName"/> }
        </Box>
    </>
}

export function MoreInformation({dataset}) {
    return <TangentAccordion title="More Information">
        <Box px={2}>
            <MetadataItem label="Date Published" item={(dataset.publication && dataset.publication.publication_date) ? dataset.publication.publication_date : dataset.citation_publication_year} itemProp="datePublished" itemScope itemType="http://schema.org/Date"/>
            <MetadataItem label="Editors" item={dataset.citation_editor_list} itemProp="editor" itemScope itemType="http://schema.org/Person"/>
            <MetadataItem label="Type" item={"Data"} />
            <MetadataItem label="Local Mean Solar" item={dataset.localMeanSolar} />
            <MetadataItem label="Local True Solar" item={dataset.localTrueSolar} />
            <MetadataItem label="Solar Longitude" item={dataset.solarLongitude} />
            <MetadataItem label="Primary Result" item={dataset.primary_result_purpose} />
            <MetadataItem label="Primary Result Processing Level" item={dataset.primary_result_processing_level} />
            <MetadataItem label="Primary Result Wavelength Range" item={dataset.primary_result_wavelength_range} />
            <MetadataItem label="Primary Result Domain" item={dataset.primary_result_domain} />
            <MetadataItem label="Primary Result Discipline Name" item={dataset.primary_result_discipline_name} />
        </Box>
    </TangentAccordion>
}


export function DeliveryInfo({dataset}) {
    const classes = useStyles()
    const publication = dataset.publication
    if(publication && publication.delivery_info) {
        return (
            <Paper className={classes.deliveryInfo}>
                <Typography color="inherit">{publication.delivery_info}</Typography>
                <Typography color="inherit">Latest release date: {publication.publication_date}</Typography>
            </Paper>
        )
    } else {
        return null
    }
}

function CollectionExample({dataset}) {
    const classes = useStyles()
    return (
        <PrimaryContent>
            { dataset.example && dataset.example.url &&
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
            }
        </PrimaryContent>
    )
}

function Downloads({dataset}) {
    const {download_url, download_size} = dataset
    if(!download_url) return null

    let buttonTitle
    if(!!download_size) {
        buttonTitle = `Download ${download_size}`
    } else {
        buttonTitle = "View Downloads"
    }
    return <LabeledListItem label="Download" item={
        <ActionButton url={download_url} icon={download_size ? <GetApp/> : <OpenInNew/>} title={buttonTitle} />
    }/>
}

function DatasetInfo({dataset, bundles}) {
    let {dataset_info_url} = dataset
    if(!dataset_info_url) { 

        // try and pull it from bundle
        dataset_info_url = bundles && bundles.length > 0 ? bundles.reduce((prev, current) => current.dataset_info_url, null) : null

        // if still no dataset info, return
        if(!dataset_info_url) return null
    }

    return <LabeledListItem label="Dataset Info" item={
        <ActionButton url={dataset_info_url} icon={<Description/>} title="View Dataset Info"/>
    }/>
}

function BrowseLink({dataset, type}) {
    const browseUrl = dataset.browse_url ? dataset.browse_url : (Array.isArray(dataset.resource_url) ? dataset.resource_url[0] : dataset.resource_url)
    if(!browseUrl || ![types.BUNDLE, types.COLLECTION].includes(type)) return null

    let buttonTitle = `Browse this ${type == types.BUNDLE ? 'Bundle' : 'Collection'}`
    
    return <LabeledListItem label="Browse" item={
        <ActionButton url={browseUrl} icon={<OpenInNew/>} prominent={true} title={buttonTitle}/>
    }/>
}

function Citation({citation}) {
    if(citation) {
        return <Box p={3}>
            <Typography variant="body2" color="textSecondary">Use the following citation to reference this data set:</Typography>
            <Typography>{citation}</Typography>
        </Box>
           
    } else return null
}

function ReleaseInfo() {
    return <Box my={2}>
            <Typography variant="body2" align="center">For past and upcoming dataset release date information, visit <Link href="https://pds.nasa.gov/datasearch/subscription-service/SS-Release.shtml">the PDS Data Releases page</Link></Typography>
        </Box>
}

function RelatedPDS3(props) {
    const pds3 = props.dataset.pds3_version_url
    if(pds3) {
        return (
            <TangentAccordion title="PDS3 version">
                <List>
                    <ListItem button component={Link} href={pds3}>
                        <ListItemText primary="Click here to browse" primaryTypographyProps={{color: "primary"}}/>
                    </ListItem>
                </List>
            </TangentAccordion>
        )
    } else return null
}

function Superseded(props) {
    const superseded = props.dataset.superseded_data
    if(superseded) {
        return (
            <TangentAccordion title="Other versions">
                <List>
                    {superseded.map(ref => 
                        <ListItem button component={Link} key={ref.browse_url + ref.name} href={ref.browse_url}>
                            <ListItemText primary={ref.name} primaryTypographyProps={{color: "primary"}}/>
                        </ListItem>
                        )}
                </List>
            </TangentAccordion>
        )
    } else return null
}

function RelatedData(props) {
    const data = props.dataset.related_data
    if(data) {
        return (
            <TangentAccordion title="Related data">
                <List>
                    {data.map(ref => 
                        <InternalLink identifier={ref.lid} key={ref.lid} passHref>
                            <ListItem button component="a" href={'?identifier=' + ref.lid}>
                                <ListItemText primary={ref.name} primaryTypographyProps={{color: "primary"}}/>
                            </ListItem>
                        </InternalLink>
                        )}
                </List>
            </TangentAccordion>
        )
    } else return null
}

function LegacyDOIs(props) {
    const data = props.dataset.legacy_dois
    if(data) {
        return (
            <TangentAccordion title="Legacy DOIs">
                <List>
                    {data.map(ref => 
                        <ListItem button component={Link} key={ref.doi} href={'https://doi.org/' + ref.doi}>
                            <ListItemText primary={`${ref.date}: ${ref.doi}`} primaryTypographyProps={{color: "primary"}}/>
                        </ListItem>
                        )}
                </List>
            </TangentAccordion>
        )
    } else return null
}

export function HiddenMicrodataValue({value, itemProp}) {
    return <span hidden style={{display: 'none'}} itemProp={itemProp}>{value}</span>
}

export function HiddenMicrodataObject({children, itemProp, type}) {
    return <span hidden style={{display: 'none'}} itemProp={itemProp} itemScope itemType={type}>{children}</span>
}