import React from 'react';
import {getBundlesForCollection} from 'api/dataset.js';
import ErrorMessage from 'components/Error.js'
import { Box, Typography, Grid, Button, Link } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    bundleImg: {
        maxHeight: '48px',
        marginRight: theme.spacing(2)
    },
    bundleLink: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1)
    }
}));

export default class Main extends React.Component {

    constructor(props) {
        super(props)
        const {isBundle, dataset} = props
        this.state = { dataset, isBundle, bundles: [], loaded: false }
    }

    componentDidMount() {
        if(!this.state.isBundle) {
            getBundlesForCollection(this.state.dataset).then(result => {
                    this.setState({
                        bundles: result,
                        loaded: true
                    })
                }, error => 
                this.setState({ error }))
        }
    }

    render() {
        const {isBundle, dataset, bundles, error} = this.state
        if(error && !isBundle) {
            return <ErrorMessage error={error}></ErrorMessage>
        } else if((isBundle || bundles.length === 0) && !dataset.other_instruments_url && !dataset.mission_bundle) { return null }
        return (
            <Grid container direction="row" justify="space-between" alignItems="center">
                {!isBundle && bundles.length > 0 &&
                    <BundleRef bundles={bundles}/>
                }
                <Box p={1}>
                    <Grid container direction="row" alignItems="center">
                        {dataset.other_instruments_url &&
                            <Button color="primary" variant="contained" href={`?identifier=${dataset.other_instruments_url}`}>Other Instruments</Button>
                        }
                        {dataset.mission_bundle &&
                            <Button color="primary" variant="contained" href={`?identifier=${dataset.mission_bundle}`}>Mission Information Bundle</Button>
                        }
                    </Grid>
                </Box>
            </Grid>
        )
    }
}

function BundleRef({bundles}) {
    const classes = useStyles()
    return <Box display="flex" alignItems="center" m={1} >
        <img className={classes.bundleImg} alt="Bundle" src="./images/icn-bundle.png" />
        <Typography>Part of </Typography>
        {bundles.map(bundle => 
            <Link className={classes.bundleLink} color="primary" key={bundle.identifier} href={'?dataset=' + bundle.identifier}>{bundle.display_name ? bundle.display_name : bundle.title}</Link>
        )}
    </Box>
}

