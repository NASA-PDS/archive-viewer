import React from 'react';
import {getCollectionsForDataset} from 'api/dataset.js';
import ErrorMessage from 'components/Error.js'
import SectionedTable from 'components/SectionedTable.js'
import { Card, Typography, CardContent } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { groupByLabelArray } from 'services/groupings';

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
        this.state = {
            loaded: false,
            collections: props.dataset.collection_ref.map(ref => { return { identifier: ref } })
        }
    }

    componentDidMount() {
        getCollectionsForDataset(this.props.dataset).then(result => {
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
        return <CollectionList collections={collections} labels={this.props.dataset.collection_type}/>
    }
}

function CollectionList({ collections, labels }) {
    const classes = useStyles()

    return (
        <Card variant="outlined" >
            <CardContent p={1}>
            <Typography variant="h5">Data in this bundle</Typography>
            <SectionedTable groups={groupByLabelArray(collections, labels)}/>
            </CardContent>
        </Card>
    )
}