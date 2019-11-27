import React from 'react';
import {getBundlesForCollection} from 'api/dataset.js';
import ErrorMessage from 'components/Error.js'

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
            <div className="family-links">
                {!isBundle && bundles.length > 0 &&
                    <div className="bundle-ref">
                        <img alt="Bundle" src="./images/icn-bundle.png" />
                        Part of 
                        {bundles.map(bundle => 
                            <a key={bundle.identifier} className="adjacent-link" href={'?dataset=' + bundle.identifier}><span>{bundle.display_name ? bundle.display_name : bundle.title}</span></a>
                        )}
                    </div>
                }
                <div className="links">
                    {dataset.other_instruments_url &&
                        <a className="big-ugly-button" href={`?dataset=${dataset.other_instruments_url}`}>Other Instruments</a>
                    }
                    {dataset.mission_bundle &&
                        <a className="big-ugly-button" href={`?dataset=${dataset.mission_bundle}`}>Mission Information Bundle</a>
                    }
                </div>
            </div>
        )
    }
}