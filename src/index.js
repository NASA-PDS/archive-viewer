import React, { useState } from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    useParams,
    withRouter,
    Link
} from 'react-router-dom'
import ReactDOM from 'react-dom'
import 'css/main.scss'
import Dataset from 'components/pages/Dataset.js'
import Target from 'components/pages/Target.js'
import Mission from 'components/pages/Mission.js'
import Spacecraft from 'components/pages/Spacecraft.js'
import Instrument from 'components/pages/Instrument.js'
import TagSearch from 'components/TagSearch.js'
import Loading from 'components/Loading'
import ErrorMessage from 'components/Error.js'
import { lookupDataset } from 'api/dataset.js';
import { lookupTarget } from 'api/target.js';
import { lookupMission } from 'api/mission.js';
import { lookupSpacecraft } from 'api/spacecraft.js';
import { lookupInstrument } from 'api/instrument.js';
import { Helmet } from 'react-helmet'
import LogicalIdentifier from 'services/LogicalIdentifier'

const pageTypes = ['dataset', 'target', 'instrument', 'mission', 'spacecraft']
const searchPages = ['tag']
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

function ParentClass(props) {
    const { type } = props
    const lidvid = new LogicalIdentifier(useParams().lidvid).denormalizedLid
    const [ model, setModel ] = useState(null)
    
    if (model === null) {
        lookup(type,lidvid).then(model => {
            setModel(model)
        })
        return <Loading fullscreen={true} />
    } else {
        if (type === 'target') return <Target target={model} />
        else if (type === 'spacecraft') return <Spacecraft spacecraft={model} />
        else if (type === 'mission') return <Mission mission={model} />
        else if (type === 'instrument') return <Instrument instrument={model} />
        else if (type === 'dataset') return <Dataset dataset={model} />
    }
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
    
    render() {
        const { error } = this.state
        
        if (error) {
            return <ErrorMessage error={error} />
        } else {
            return (
                <Router>
                    <Helmet>
                        <base href="/demo/"></base>
                    </Helmet>
                    <Switch>
                        <Route path="/dataset/:lidvid" children={<ParentClass type="dataset" />} />
                        <Route path="/target/:lidvid" children={<ParentClass type="target" />} />
                        <Route path="/instrument/:lidvid" children={<ParentClass type="instrument" />} />
                        <Route path="/mission/:lidvid" children={<ParentClass type="mission" />} />
                        <Route path="/spacecraft/:lidvid" children={<ParentClass type="spacecraft" />} />
                        <Route path="/" children={<Index />} />
                    </Switch>
                </Router>
            )
        }
    }
}

function Index() {
    const escapeLid = lid => {
        const x = new LogicalIdentifier(lid).normalizedLid
        console.log(x);
        return x
    }
    
    return (
        <div>
            <h1>PDS Archive Viewer</h1>
            <div><p className="resource-description">Here are some links to get started...</p></div>
            <div className="co-main">
            <section>
                <h2>Targets</h2>
                <ul>
                    <li><h3>Planets &#38; Satellites</h3></li>
                    <ul>
                        <li>
                            <Link to={escapeLid('/target/urn:nasa:pds:context:target:planet.mercury')}>Mercury</Link>
                        </li>
                        <li><Link to={escapeLid("/target/urn:nasa:pds:context:target:planet.venus")}>Venus</Link></li>
                        <li><Link to={escapeLid("/target/urn:nasa:pds:context:target:planet.earth")}>Earth</Link></li>
                        <ul>
                            <li><Link to={escapeLid("/target/urn:nasa:pds:context:target:satellite.earth.moon")}>Moon</Link></li>
                        </ul>
                        <li><Link to={escapeLid("/target/urn:nasa:pds:context:target:planet.mars")}>Mars</Link></li>
                        <ul>
                            <li><Link to={escapeLid("/target/urn:nasa:pds:context:target:satellite.mars.deimos")}>Deimos</Link></li>
                            <li><Link to={escapeLid("/target/urn:nasa:pds:context:target:satellite.mars.phobos")}>Phobos</Link></li>
                        </ul>
                        <li><Link to={escapeLid("/target/urn:nasa:pds:context:target:planet.jupiter")}>Jupiter</Link></li>
                        <ul>
                            <li><Link to={escapeLid("/target/urn:nasa:pds:context:target:satellite.jupiter.io")}>Io</Link></li>
                            <li><Link to={escapeLid("/target/urn:nasa:pds:context:target:satellite.jupiter.europa")}>Europa</Link></li>
                            <li><Link to={escapeLid("/target/urn:nasa:pds:context:target:satellite.jupiter.ganymede")}>Ganymede</Link></li>
                            <li><Link to={escapeLid("/target/urn:nasa:pds:context:target:satellite.jupiter.callisto")}>Callisto</Link></li>
                        </ul>
                        <li><Link to="/target/urn:nasa:pds:context:target:planet.saturn">Saturn</Link></li>
                        <ul>
                            <li><Link to="/target/urn:nasa:pds:context:target:satellite.saturn.atlas">Atlas</Link></li>
                            <li><Link to="/target/urn:nasa:pds:context:target:satellite.saturn.calypso">Calypso</Link></li>
                            <li><Link to="/target/urn:nasa:pds:context:target:satellite.saturn.daphnis">Daphnis</Link></li>
                            <li><Link to="/target/urn:nasa:pds:context:target:satellite.saturn.dione">Dione</Link></li>
                            <li><Link to="/target/urn:nasa:pds:context:target:satellite.saturn.enceladus">Enceladus</Link></li>
                            <li><Link to="/target/urn:nasa:pds:context:target:satellite.saturn.helene">Helene</Link></li>
                            <li><Link to="/target/urn:nasa:pds:context:target:satellite.saturn.hyperion">Hyperion</Link></li>
                            <li><Link to="/target/urn:nasa:pds:context:target:satellite.saturn.iapetus">Iapetus</Link></li>
                            <li><Link to="/target/urn:nasa:pds:context:target:satellite.saturn.janus">Janus</Link></li>
                            <li><Link to="/target/urn:nasa:pds:context:target:satellite.saturn.mimas">Mimas</Link></li>
                            <li><Link to="/target/urn:nasa:pds:context:target:satellite.saturn.pan">Pan</Link></li>
                            <li><Link to="/target/urn:nasa:pds:context:target:satellite.saturn.pandora">Pandora</Link></li>
                            <li><Link to="/target/urn:nasa:pds:context:target:satellite.saturn.rhea">Rhea</Link></li>
                            <li><Link to="/target/urn:nasa:pds:context:target:satellite.saturn.telesto">Telesto</Link></li>
                            <li><Link to="/target/urn:nasa:pds:context:target:satellite.saturn.tethys">Tethys</Link></li>
                            <li><Link to="/target/urn:nasa:pds:context:target:satellite.saturn.titan">Titan</Link></li>
                        </ul>
                        <li><Link to="/target/urn:nasa:pds:context:target:planet.uranus">Uranus</Link></li>
                        <li><Link to="/target/urn:nasa:pds:context:target:planet.neptune">Neptune</Link></li>
                    </ul>
                    <li><h3>Dwarf Planets &#38; Satellites</h3></li>
                    <ul>
                        <li><Link to="/target/urn:nasa:pds:context:target:dwarf_planet.1_ceres">1 Ceres</Link></li>
                        <li><Link to="/target/urn:nasa:pds:context:target:dwarf_planet.134340_pluto">134340 Pluto</Link></li>
                        <ul>
                            <li><Link to="/target/urn:nasa:pds:context:target:satellite.134340_pluto.charon">Charon</Link></li>
                        </ul>
                    </ul>
                    <li><h3>Asteroids</h3></li>
                    <ul>
                        <li><Link to="/target/urn:nasa:pds:context:target:asteroid.4_vesta">4 Vesta</Link></li>
                        <li><Link to="/target/urn:nasa:pds:context:target:asteroid.21_lutetia">21 Lutetia</Link></li>
                        <li><Link to="/target/urn:nasa:pds:context:target:asteroid.243_ida">243 Ida</Link></li>
                        <li><Link to="/target/urn:nasa:pds:context:target:asteroid.253_mathilde">253 Mathilde</Link></li>
                        <li><Link to="/target/urn:nasa:pds:context:target:asteroid.951_gaspra">951 Gaspra</Link></li>
                        <li><Link to="/target/urn:nasa:pds:context:target:asteroid.433_eros">433 Eros</Link></li>
                        <li><Link to="/target/urn:nasa:pds:context:target:asteroid.2867_steins">2867 Steins</Link></li>
                        <li><Link to="/target/urn:nasa:pds:context:target:asteroid.5535_annefrank">5535 AnneFrank</Link></li>
                        <li><Link to="/target/urn:nasa:pds:context:target:asteroid.25143_itokawa">25143 Itokawa</Link></li>
                        <li><Link to="/target/urn:nasa:pds:context:target:asteroid.101955_bennu">101955 Bennu</Link></li>
                    </ul>
                    <li><h3>Comets</h3></li>
                    <ul>
                        <li><Link to="/target/urn:nasa:pds:context:target:comet.9p_tempel_1">9P Tempel 1</Link></li>
                        <li><Link to="/target/urn:nasa:pds:context:target:comet.19p_borrelly">19P Borrelly</Link></li>
                        <li><Link to="/target/urn:nasa:pds:context:target:comet.67p_churyumov-gerasimenko">67P Churyumov-Gerasimenko</Link></li>
                        <li><Link to="/target/urn:nasa:pds:context:target:comet.81p_wild_2">81P Wild 2</Link></li>
                        <li><Link to="/target/urn:nasa:pds:context:target:comet.103p_hartley_2">103P Hartley 2</Link></li>
                    </ul>
                </ul>
            </section>
            <section>
                <h2>Spacecraft</h2>
                <ul>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.a17c">Apollo 17</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.co">Cassini Orbiter</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.dawn">Dawn</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.grail-a">Gravity Recovery and Interior Laboratory A (GRAIL Ebb)</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.grail-b">Gravity Recovery and Interior Laboratory B (GRAIL Flow)</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.hay">Hayabusa</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.hp">Huygens Probe</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.insight">InSight</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.ladee"> Lunar Atmosphere and Dust Environment Explorer (LADEE)</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.lp">Lunar Prospector</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.lcross">Lunar Crater Observation and Sensing Satellite (LCROSS)</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.mr6">Mariner 6</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.mr7">Mariner 7</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.mr9">Mariner 9</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.mer1">Mars Exploration Rover - Opportunity</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.mer2">Mars Exploration Rover - Spirit</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.mgs">Mars Global Surveyor</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.mo">Mars Observer</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.ody">Mars Odyssey</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.mpfl">Mars Pathfinder Lander</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.mpfr">Mars Pathfinder Rover (Sojourner)</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.mro">Mars Reconnaissance Orbiter</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.msl">Mars Science Laboratory (Curiosity)</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.near">Near Earth Asteroid Rendezvous (NEAR Shoemaker)</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.orex">Origins, Spectral Interpretation, Resource Identification, Security, Regolith Explorer (OSIRIS-REx)</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.p11">Pioneer 11</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.phx">Phoenix</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.vl1">Viking Lander 1</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.vl2">Viking Lander 2</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.vo1">Viking Orbiter 1</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.vo2">Viking Orbiter 2</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.vg1">Voyager 1</Link></li>
                    <li><Link to="/spacecraft/urn:nasa:pds:context:instrument_host:spacecraft.vg2">Voyager 2</Link></li>
                </ul>
            </section>
            <section>
                <h2>Datasets</h2>
                <ul>
                    <li><Link to="/dataset/urn:nasa:pds:orex.ocams">OSIRIS-REx OCAMS Bundle</Link></li>
                    <li><Link to="/dataset/urn:nasa:pds:apollodoc">Apollo Documents Bundle</Link></li>
                    <li><Link to="/dataset/urn:nasa:pds:insight_cameras">InSight Cameras Bundle</Link></li>
                </ul>
            </section>
            </div>
        </div>
    )
}

// ========================================

ReactDOM.render(
    <Main />,
    document.getElementById('root')
);
