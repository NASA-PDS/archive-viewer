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
            return <Loading fullscreen={true} />
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
				    <li><h3>Planets &#38; Satellites</h3></li>
					<ul>
                        <li><a href="?target=urn:nasa:pds:context:target:planet.mercury">Mercury</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:planet.venus">Venus</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:planet.earth">Earth</a></li>
						<ul>
                            <li><a href="?target=urn:nasa:pds:context:target:satellite.earth.moon">Moon</a></li>
						</ul>
                        <li><a href="?target=urn:nasa:pds:context:target:planet.mars">Mars</a></li>
						<ul>
    						<li><a href="?target=urn:nasa:pds:context:target:satellite.mars.deimos">Deimos</a></li>
						    <li><a href="?target=urn:nasa:pds:context:target:satellite.mars.phobos">Phobos</a></li>
						</ul>
                        <li><a href="?target=urn:nasa:pds:context:target:planet.saturn">Saturn</a></li>
						<ul>
    						<li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.atlas">Atlas</a></li>
	    					<li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.calypso">Calypso</a></li>
		    				<li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.daphnis">Daphnis</a></li>
			    			<li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.dione">Dione</a></li>
						    <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.enceladus">Enceladus</a></li>
						    <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.helene">Helene</a></li>
						    <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.hyperion">Hyperion</a></li>
						    <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.iapetus">Iapetus</a></li>
						    <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.janus">Janus</a></li>
						    <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.mimas">Mimas</a></li>
						    <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.pan">Pan</a></li>
						    <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.pandora">Pandora</a></li>
						    <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.rhea">Rhea</a></li>
						    <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.telesto">Telesto</a></li>
						    <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.tethys">Tethys</a></li>
						    <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.titan">Titan</a></li>
						</ul>
                        <li><a href="?target=urn:nasa:pds:context:target:planet.jupiter">Jupiter</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:planet.uranus">Uranus</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:planet.neptune">Neptune</a></li>
					</ul>
				    <li><h3>Dwarf Planets</h3></li>
					<ul>
					    <li><a href="?target=urn:nasa:pds:context:target:dwarf_planet.1_ceres">1 Ceres</a></li>
						<li><a href="?target=urn:nasa:pds:context:target:dwarf_planet.134340_pluto">134340 Pluto</a></li>
					</ul>
				    <li><h3>Asteroids</h3></li>
					<ul>
					    <li><a href="?target=urn:nasa:pds:context:target:asteroid.4_vesta">4 Vesta</a></li>
					    <li><a href="?target=urn:nasa:pds:context:target:asteroid.21_lutetia">21 Lutetia</a></li>
						<li><a href="?target=urn:nasa:pds:context:target:asteroid.243_ida">243 Ida</a></li>
						<li><a href="?target=urn:nasa:pds:context:target:asteroid.253_mathilde">253 Mathilde</a></li>
						<li><a href="?target=urn:nasa:pds:context:target:asteroid.951_gaspra">951 Gaspra</a></li>
						<li><a href="?target=urn:nasa:pds:context:target:asteroid.433_eros">433 Eros</a></li>
						<li><a href="?target=urn:nasa:pds:context:target:asteroid.2867_steins">2867 Steins</a></li>
						<li><a href="?target=urn:nasa:pds:context:target:asteroid.5535_annefrank">5535 AnneFrank</a></li>
						<li><a href="?target=urn:nasa:pds:context:target:asteroid.25143_itokawa">25143 Itokawa</a></li>
						<li><a href="?target=urn:nasa:pds:context:target:asteroid.101955_bennu">101955 Bennu</a></li>
					</ul>
				    <li><h3>Comets</h3></li>
					<ul>
					    <li><a href="?target=urn:nasa:pds:context:target:comet.9p_tempel_1">9P Tempel 1</a></li>
					    <li><a href="?target=urn:nasa:pds:context:target:comet.19p_borrelly">19P Borrelly</a></li>
					    <li><a href="?target=urn:nasa:pds:context:target:comet.67p_churyumov-gerasimenko">67P Churyumov-Gerasimenko</a></li>
					    <li><a href="?target=urn:nasa:pds:context:target:comet.81p_wild_2">81P Wild 2</a></li>
					    <li><a href="?target=urn:nasa:pds:context:target:comet.103p_hartley_2">103P Hartley 2</a></li>
					</ul>
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
