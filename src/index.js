import React from 'react';
import { render } from 'react-snapshot';
import 'main.scss';
import Dataset from 'components/Dataset.js'
import Error from 'components/Error.js'
import {lookupDataset} from 'api.js';

class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            loaded: false,
            dataset: null,
        }
    }

    componentDidMount() {

        let params = new URLSearchParams(window.location.search);
        let lidvid = params.get('dataset');

        lookupDataset(lidvid).then(result => {
            if(result.length === 0) {
                this.setState({
                    error: { message: 'No dataset found for lidvid ' + lidvid}
                })
            } else if(result.length > 1) {
                this.setState({
                    error: { message: 'More than one dataset found for lidvid ' + lidvid}
                })
            } else {
                this.setState({
                    dataset: result,
                    loaded: true
                })
            }
        }, error => {
            this.setState({
                error
            })
        })
    }
    render() {
        const { error, loaded } = this.state
        if(error) {
            return <Error error={error} />
        } else if (!loaded) {
            return <Loading />
        } else {
            return <Dataset dataset={this.state.dataset} />
        }
    }
}

function Loading() {
    return <div className="lds-ring"><div></div><div></div><div></div><div></div></div>
}

// ========================================

render(
    <Main />,
    document.getElementById('root')
);
