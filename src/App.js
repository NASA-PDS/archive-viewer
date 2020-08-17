import React from 'react';
import { Bundle, Collection, PDS3Dataset } from 'components/pages/Dataset.js'
import Target from 'components/pages/Target.js'
import Mission from 'components/pages/Mission.js'
import Spacecraft from 'components/pages/Spacecraft.js'
import Instrument from 'components/pages/Instrument.js'
import TagSearch from 'components/TagSearch.js'
import Loading from 'components/Loading'
import ErrorMessage from 'components/Error.js'
import FrontPage from './FrontPage'
import { initialLookup } from 'api/common.js'
import { resolveType, types } from 'services/pages.js'


const oldParameters = ['dataset', 'target', 'instrument', 'mission', 'spacecraft']
const searchPages = ['tag']

class App extends React.Component {
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
        let lidvid
        
        // get lid from url
        // backwards compatibility: also look at old accepted parameters
        [...oldParameters, 'identifier'].forEach(type => {
            if(!!params.get(type)) lidvid = params.get(type)
        })

        if(!!lidvid) {
            initialLookup(lidvid).then(result => {
                let type = resolveType(result)
                if(result.length === 0) {
                    this.setState({
                        error: new Error(`No ${type} found for lidvid ${lidvid}`)
                    })
                } else if(result.length > 1) {
                    this.setState({
                        error: new Error(`More than one ${type} found for lidvid ${lidvid}`)
                    })
                } else {
                    this.setState({
                        type,
                        model: result,
                        loaded: true
                    })
                }
            }, error => {
                this.setState({
                    error: error
                })
            })
            return
        }

        for(let type of searchPages) {
            let search = params.get(type)
            if(search) {
                this.setState({
                    loaded: true,
                    type: type,
                    model: params
                })
                return
            }
        }

        // no page type found, so just render default
        this.setState({
            type: 'default',
            loaded: 'true'
        })
    }
    render() {
        const { error, loaded, type, model } = this.state
        if(error) {
            return <ErrorMessage error={error} />
        } else if (!loaded) {
            return <Loading fullscreen={true} />
        } else if (type === types.BUNDLE) {
            return <Bundle dataset={model} />
        } else if (type === types.COLLECTION) {
            return <Collection dataset={model} />
        } else if (type === types.PDS3) {
            return <PDS3Dataset dataset={model} />
        } else if (type === types.TARGET) {
            return <Target target={model} />
        } else if (type === types.INSTRUMENT) {
            return <Instrument instrument={model} />
        } else if (type === types.MISSION) {
            return <Mission mission={model} />
        } else if (type === types.SPACECRAFT) {
            return <Spacecraft spacecraft={model} />
        } else if (type === 'tag') {
            return <TagSearch tags={model.getAll('tag')} type={model.get('type')} />
        } else if(error) {
            return <ErrorMessage error={"Unknown result type"} />
        } else {
            return <FrontPage />
        }
    }
}

export default App