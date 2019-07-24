import React from 'react';
import { render } from 'react-snapshot';
import 'main.scss';
import Dataset from 'components/Dataset.js'
import Error from 'components/Error.js'
import { lookupDataset } from 'dataset-api.js';
import { lookupTarget } from 'target-api';

const pageTypes = ['dataset', 'target', 'instrument', 'mission', 'spacecraft']
const lookup = (type, lidvid) => {
    let func = () => new Promise((_, reject) => reject(new Error("Invalid lookup")));
    switch (type) {
        case 'dataset': func = lookupDataset; break;
        case 'target': func = lookupTarget; break;
    }
    return func(lidvid)
}

class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            loaded: false,
            model: null,
        }
    }

    componentDidMount() {

        let params = new URLSearchParams(window.location.search);

        for(let type of pageTypes) {
            let lidvid = params.get(type);
            if(lidvid) {
                this.setState({ type })
                lookup(type, lidvid).then(result => {
                    if(result.length === 0) {
                        this.setState({
                            error: new Error(`No ${type} found for lidvid ${lidvid}`)
                        })
                    } else if(result.length > 1) {
                        this.setState({
                            error: new Error(`More than one ${type} found for lidvid ${lidvid}`)
                        })
                    } else {
                        console.log(result)
                        this.setState({
                            model: result,
                            loaded: true
                        })
                    }
                }, error => {
                    this.setState({
                        error: error
                    })
                })
                break;
            }
        }
        
    }
    render() {
        const { error, loaded, type, model } = this.state
        if(error) {
            return <Error error={error} />
        } else if (!loaded) {
            return <Loading />
        } else if (type === 'dataset') {
            return <Dataset dataset={model} />
        } else if (type === 'target') {
            return 'Super fancy target page'
        } else if (type === 'instrument') {
            return 'Super fancy instrument page'
        } else if (type === 'mission') {
            return 'Super fancy target page'
        } else if (type === 'spacecraft') {
            return 'Super fancy target page'
        } else {
            return <Error error={new Error("Couldn't render anything")} />
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
