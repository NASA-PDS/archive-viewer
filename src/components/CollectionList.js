import React from 'react';
import {getCollectionsForDataset} from 'api/dataset.js';
import ErrorMessage from 'components/Error.js'
import SectionedTable from 'components/SectionedTable.js'
import { Card, Typography, CardContent, Box } from '@material-ui/core';
import { groupByLabelArray } from 'services/groupings';

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

    return (
        <Box my={2}>
            <Card variant="outlined" >
                <CardContent p={1}>
                <Typography variant="h5">Data in this bundle</Typography>
                <SectionedTable groups={groupByLabelArray(collections, labels)}/>
                </CardContent>
            </Card>
        </Box>
    )
}