import React from 'react';
import {getCollectionsForDataset} from 'api/dataset.js';
import ErrorMessage from 'components/Error.js'
import { Box, List, ListItem, ListItemText, Avatar, ListItemAvatar, Link, Divider, Typography, ListItemSecondaryAction, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import PrimaryContent from 'components/PrimaryContent'

const useStyles = makeStyles((theme) => ({
    container: {
        borderLeft: '8px solid ' + theme.palette.primary.light
    },
    collectionList: {
        fontSize: theme.typography.body1.fontSize * 1.2
    },
    downloadIcon: {
        maxHeight: theme.typography.fontSize * 2
    }
}));

export default class Main extends React.Component {
    constructor(props) {
        super(props)
        const dataset = props.dataset
        this.state = {
            loaded: false,
            dataset: dataset,
            collections: dataset.collection_ref.map(ref => { return { identifier: ref } })
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
        const { error, collections } = this.state
        if(error) {
            return <ErrorMessage error={error} />
        } else
        return <CollectionList collections={collections} />
    }
}

function CollectionList({ collections }) {
    const classes = useStyles()

    let sortedCollections = collections.sort((a, b) => {
        if (a.collection_type === "Document") { return -1}
        if (b.collection_type === "Document") { return 1 }
        return 0
    })
    return (
        <PrimaryContent>
            <Typography variant="h5">In this dataset...</Typography>
            <List className={classes.container}>
                { sortedCollections.map(collection =>
                    <React.Fragment key={collection.identifier}>
                        <ListItem button component={Link} href={'?dataset=' + collection.identifier} key={collection.identifier}>
                            <ListItemAvatar>
                                <Avatar variant="square" alt="Collection Icon" src="/images/icn-collection.png" />
                            </ListItemAvatar>
                            <ListItemText 
                                primary={nameFinder(collection)} primaryTypographyProps={{variant: 'h6'}}
                                secondary={collection.example && collection.example.url && (
                                    <>
                                        {collection.collection_type === "Document" ? 
                                            <Typography component="span">Key Document: </Typography> : 
                                            <Typography component="span">Example File: </Typography>
                                        }
                                        <Link href={collection.example.url}>{collection.example.title ? collection.example.title : collection.example.filename}</Link>
                                    </>
                                )
                                }/>
                                {collection.download_url && (<ListItemSecondaryAction>
                                    <Button href={collection.download_url}><img alt="" className={classes.downloadIcon} src="./images/icn-download-rnd.png"/>{collection.download_size && ( 
                                        <span className="download-size">({collection.download_size}12kb)</span> 
                                    )}</Button>
                                </ListItemSecondaryAction>
                            )}
                        </ListItem>
                        <Divider variant="inset" component="li"/>
                    </React.Fragment>
                )}
            </List>
        </PrimaryContent>
    )
}

function nameFinder(collection) {
    return collection.display_name ? collection.display_name : collection.title ? collection.title : collection.identifier
}