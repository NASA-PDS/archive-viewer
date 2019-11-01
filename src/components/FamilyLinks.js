import React from 'react';
import {getBundlesForCollection} from 'api/dataset.js';
import ErrorMessage from 'components/Error.js'
import { Link } from 'react-router-dom'

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
        } else if((isBundle || bundles.length == 0) && !dataset.other_instruments_url && !dataset.mission_bundle) { return null }
        return (
            <div className="family-links">
                {!isBundle && bundles.length > 0 &&
                    <div className="bundle-ref">
                        <img src="/images/icn-bundle.png" />
                        Part of 
                        {bundles.map(bundle => 
                            <Link key={bundle.identifier} className="adjacent-link" to={'/dataset/' + bundle.identifier}><span>{bundle.display_name ? bundle.display_name : bundle.title}</span></Link>
                        )}
                    </div>
                }
                <div className="links">
                    {dataset.other_instruments_url &&
                        <Link className="big-ugly-button" to={`/dataset/${dataset.other_instruments_url}`}>Other Instruments</Link>
                    }
                    {dataset.mission_bundle &&
                        <Link className="big-ugly-button" to={`/dataset/${dataset.mission_bundle}`}>Mission Information Bundle</Link>
                    }
                </div>
            </div>
        )
    }
}