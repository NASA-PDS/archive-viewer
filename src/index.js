import React from 'react';
import { render } from 'react-snapshot';
import 'css/main.scss';
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
                return
            }
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
        } else if (type === 'tag') {
            return <TagSearch tags={model.getAll('tag')} type={model.get('type')} />
        } else {
            return <Index />
        }
    }
}

function Index() {
    return (
        <div>
            <h1>PDS Archive Viewer</h1>
            <div className="co-main">
            <div><p className="resource-description">Here are some links to get started...</p></div>

            <section>
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
                    <li><a href="?target=urn:nasa:pds:context:target:planet.jupiter">Jupiter</a></li>
                    <ul>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.adrastea">Adrastea</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.aitne">Aitne</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.amalthea">Amalthea</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.ananke">Ananke</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.autonoe">Autonoe</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.callirrhoe">Callirrhoe</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.callisto">Callisto</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.carme">Carme</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.chaldene">Chaldene</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.dia">Dia</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.elara">Elara</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.erinome">Erinome</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.euanthe">Euanthe</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.eukelade">Eukelade</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.europa">Europa</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.eurydome">Eurydome</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.ganymede">Ganymede</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.harpalyke">Harpalyke</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.himalia">Himalia</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.io">Io</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.iocaste">Iocaste</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.isonoe">Isonoe</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.kale">Kale</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.kalyke">Kalyke</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.leda">Leda</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.megaclite">Megaclite</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.metis">Metis</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.pasiphae">Pasiphae</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.pasithee">Pasithee</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.praxidike">Praxidike</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.sponde">Sponde</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.taygete">Taygete</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.thebe">Thebe</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.jupiter.thyone">Thyone</a></li>
                    </ul>
                    <li><a href="?target=urn:nasa:pds:context:target:planet.saturn">Saturn</a></li>
                    <ul>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.aegaeon">Aegaeon</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.albiorix">Albiorix</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.atlas">Atlas</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.anthe">Anthe</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.bebhionn">Bebhionn</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.bergelmir">Bergelmir</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.bestla">Bestla</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.calypso">Calypso</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.daphnis">Daphnis</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.dione">Dione</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.enceladus">Enceladus</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.erriapus">Erriapus</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.fornjot">Fornjot</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.greip">Greip</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.hati">Hati</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.helene">Helene</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.hyperion">Hyperion</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.hyrrokkin">Hyrrokkin</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.iapetus">Iapetus</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.ijiraq">Ijiraq</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.janus">Janus</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.kari">Kari</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.kiviuq">Kiviuq</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.loge">Loge</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.methone">Methone</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.mimas">Mimas</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.mundilfari">Mundilfari</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.narvi">Narvi</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.paaliaq">Paaliaq</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.pallene">Pallene</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.pan">Pan</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.pandora">Pandora</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.phoebe">Phoebe</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.polydeuces">Polydeuces</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.prometheus">Prometheus</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.rhea">Rhea</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.skathi">Skathi</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.siarnaq">Siarnaq</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.surtur">Surtur</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.suttungr">Suttungr</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.tarqeq">Tarqeq</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.tarvos">Tarvos</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.telesto">Telesto</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.tethys">Tethys</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.thrymr">Thrymr</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.titan">Titan</a></li>
                        <li><a href="?target=urn:nasa:pds:context:target:satellite.saturn.ymir">Ymir</a></li>
                        </ul>
                    <li><a href="?target=urn:nasa:pds:context:target:planet.uranus">Uranus</a></li>
                    <li><a href="?target=urn:nasa:pds:context:target:planet.neptune">Neptune</a></li>
                </ul>
            <li><h3>Dwarf Planets &#38; Satellites</h3></li>
                <ul>
                    <li><a href="?target=urn:nasa:pds:context:target:dwarf_planet.1_ceres">1 Ceres</a></li>
                    <li><a href="?target=urn:nasa:pds:context:target:dwarf_planet.134340_pluto">134340 Pluto</a></li>
                        <ul>
                            <li><a href="?target=urn:nasa:pds:context:target:satellite.134340_pluto.charon">Charon</a></li>
                        </ul>
                </ul>
            <li><h3>Asteroids</h3></li>
                <ul>
                    <li><a href="?target=urn:nasa:pds:context:target:asteroid.4_vesta">4 Vesta</a></li>
                    <li><a href="?target=urn:nasa:pds:context:target:asteroid.21_lutetia">21 Lutetia</a></li>
                    <li><a href="?target=urn:nasa:pds:context:target:asteroid.243_ida">243 Ida</a></li>
                    <li><a href="?target=urn:nasa:pds:context:target:asteroid.253_mathilde">253 Mathilde</a></li>
                    <li><a href="?target=urn:nasa:pds:context:target:asteroid.951_gaspra">951 Gaspra</a></li>
                    <li><a href="?target=urn:nasa:pds:context:target:asteroid.433_eros">433 Eros</a></li>
                    <li><a href="?target=urn:nasa:pds:context:target:asteroid.2685_masursky">2685 Masursky</a></li>
                    <li><a href="?target=urn:nasa:pds:context:target:asteroid.2867_steins">2867 Steins</a></li>
                    <li><a href="?target=urn:nasa:pds:context:target:asteroid.5535_annefrank">5535 AnneFrank</a></li>
                    <li><a href="?target=urn:nasa:pds:context:target:asteroid.25143_itokawa">25143 Itokawa</a></li>
                    <li><a href="?target=urn:nasa:pds:context:target:asteroid.101955_bennu">101955 Bennu</a></li>
                    <li><a href="?target=urn:nasa:pds:context:target:asteroid.162173_ryugu">162173 Ryugu</a></li>
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
            
            <section>
            <h2>Spacecraft</h2>
                <ul>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.a17c">Apollo 17</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.co">Cassini Orbiter</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.dawn">Dawn</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.grail-a">Gravity Recovery and Interior Laboratory A (GRAIL Ebb)</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.grail-b">Gravity Recovery and Interior Laboratory B (GRAIL Flow)</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.hay">Hayabusa</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.hp">Huygens Probe</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.insight">InSight</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.ladee"> Lunar Atmosphere and Dust Environment Explorer (LADEE)</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.lp">Lunar Prospector</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.lcross">Lunar Crater Observation and Sensing Satellite (LCROSS)</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.mr6">Mariner 6</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.mr7">Mariner 7</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.mr9">Mariner 9</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.mer1">Mars Exploration Rover - Opportunity</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.mer2">Mars Exploration Rover - Spirit</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.mgs">Mars Global Surveyor</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.mo">Mars Observer</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.ody">Mars Odyssey</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.mpfl">Mars Pathfinder Lander</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.mpfr">Mars Pathfinder Rover (Sojourner)</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.mro">Mars Reconnaissance Orbiter</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.msl">Mars Science Laboratory (Curiosity)</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.near">Near Earth Asteroid Rendezvous (NEAR Shoemaker)</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.orex">Origins, Spectral Interpretation, Resource Identification, Security, Regolith Explorer (OSIRIS-REx)</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.p11">Pioneer 11</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.phx">Phoenix</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.vl1">Viking Lander 1</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.vl2">Viking Lander 2</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.vo1">Viking Orbiter 1</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.vo2">Viking Orbiter 2</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.vg1">Voyager 1</a></li>
                    <li><a href="?spacecraft=urn:nasa:pds:context:instrument_host:spacecraft.vg2">Voyager 2</a></li>
                </ul>
            </section>
            
            <section>
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
