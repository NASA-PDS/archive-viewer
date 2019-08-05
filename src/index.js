import React from 'react';
import { render } from 'react-snapshot';
import 'css/main.scss';
import Dataset from 'components/Dataset.js'
import Target from 'components/Target.js'
import Mission from 'components/Mission.js'
import Spacecraft from 'components/Spacecraft.js'
import Instrument from 'components/Instrument.js'
import Loading from 'components/Loading'
import ErrorMessage from 'components/Error.js'
import { lookupDataset } from 'api/dataset.js';
import { lookupTarget } from 'api/target.js';
import { lookupMission } from 'api/mission.js';
import { lookupSpacecraft } from 'api/spacecraft.js';
import { lookupInstrument } from 'api/instrument.js';

const pageTypes = ['dataset', 'target', 'instrument', 'mission', 'spacecraft']
const lookup = (type, lidvid) => {
    let func = () => new Promise((_, reject) => reject(new Error("Invalid lookup")));
    switch (type) {
        case 'dataset': func = lookupDataset; break;
        case 'target': func = lookupTarget; break;
        case 'mission': func = lookupMission; break;
        case 'instrument': func = lookupInstrument; break;
        case 'spacecraft': func = lookupSpacecraft; break;
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
        let pageType
        for(let type of pageTypes) {
            let lidvid = params.get(type);
            if(lidvid) {
                this.setState({ type })
                pageType = type
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

        // no page type found, so just render default
        if(!pageType) {
            this.setState({
                type: 'default',
                loaded: 'true'
            })
        }
        
    }
    render() {
        const { error, loaded, type, model } = this.state
        if(error) {
            return <ErrorMessage error={error} />
        } else if (!loaded) {
            return <Loading />
        } else if (type === 'dataset') {
            return <Dataset dataset={model} />
        } else if (type === 'target') {
            return <Target target={model} />
        } else if (type === 'instrument') {
            return <Instrument instrument={model} />
        } else if (type === 'mission') {
            return <Mission mission={model} />
        } else if (type === 'spacecraft') {
            return <Spacecraft spacecraft={model} />
        } else {
            return <Index />
        }
    }
}

function Index() {
    return (
        <div>
            <h1>PDS Archive Viewer</h1>
            <div><p className="resource-description">Here are some links to get started...</p></div>
            <div className="co-main">
            <section className="list-box">
                <h2>Targets</h2>
                <ul>
                    <li><a href="?target=urn:nasa:pds:context:target:planet.mars">Mars</a></li>
                    <li><a href="?target=urn:nasa:pds:context:target:planet.saturn">Saturn</a></li>
                    <li><a href="?target=urn:nasa:pds:context:target:satellite.earth.moon">Earth's Moon</a></li>
                </ul>
            </section>

            <section className="list-box">
                <h2>Spacecraft</h2>
                <ul>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.insight">InSight</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.co">Cassini</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.a17c">Apollo 17</a></li>
                </ul>
            </section>

            <section className="list-box">
                <h2>Datasets</h2>
                <ul>
                    <li><a href="?dataset=urn:nasa:pds:orex.ocams">OSIRIS-REx OCAMS Bundle</a></li>
                    <li><a href="?dataset=urn:nasa:pds:apollodoc">Apollo Documents Bundle</a></li>
                    <li><a href="?dataset=urn:nasa:pds:insight_cameras">InSight Cameras Bundle</a></li>
                </ul>
            </section>
            </div>
        </div>
    )
}

// ========================================

render(
    <Main />,
    document.getElementById('root')
);
