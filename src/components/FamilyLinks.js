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
        } else
        return (
            <div className="family-links">
                {!isBundle && bundles.length > 0 &&
                    <div>
                        <img src="/images/icn-bundle.png" />
                        Part of 
                        {bundles.map(bundle => 
                            <a key={bundle.identifier} className="ignore-a-styling" href={'?dataset=' + bundle.identifier}><span>{bundle.display_name ? bundle.display_name : bundle.title}</span></a>
                        )}
                    </div>
                }
                <div>
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