import React from 'react';
import 'css/main.scss';
import ReactDOM from 'react-dom'
import Dataset from 'components/pages/Dataset.js'
import Target from 'components/pages/Target.js'
import Mission from 'components/pages/Mission.js'
import Spacecraft from 'components/pages/Spacecraft.js'
import Instrument from 'components/pages/Instrument.js'
import TagSearch from 'components/TagSearch.js'
import Loading from 'components/Loading'
import ErrorMessage from 'components/Error.js'
import { initialLookup } from 'api/common.js'
import { resolveType, types } from 'api/pages.js'


const oldParameters = ['dataset', 'target', 'instrument', 'mission', 'spacecraft']
const searchPages = ['tag']

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
        } else if (type === types.DATASET) {
            return <Dataset dataset={model} />
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
                    <li><a href="?identifier=urn:nasa:pds:context:target:planet.mercury">Mercury</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:target:planet.venus">Venus</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:target:planet.earth">Earth</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:target:planet.mars">Mars</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:target:planet.jupiter">Jupiter</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:target:planet.saturn">Saturn</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:target:planet.uranus">Uranus</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:target:planet.neptune">Neptune</a></li>
                </ul>
            <li><h3>Dwarf Planets &#38; Satellites</h3></li>
                <ul>
                    <li><a href="?identifier=urn:nasa:pds:context:target:dwarf_planet.1_ceres">1 Ceres</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:target:dwarf_planet.134340_pluto">134340 Pluto</a></li>
                </ul>
            <li><h3>Asteroids</h3></li>
                <ul>
                    <li><a href="?identifier=urn:nasa:pds:context:target:asteroid.4_vesta">4 Vesta</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:target:asteroid.21_lutetia">21 Lutetia</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:target:asteroid.243_ida">243 Ida</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:target:asteroid.253_mathilde">253 Mathilde</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:target:asteroid.951_gaspra">951 Gaspra</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:target:asteroid.433_eros">433 Eros</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:target:asteroid.2685_masursky">2685 Masursky</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:target:asteroid.2867_steins">2867 Steins</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:target:asteroid.5535_annefrank">5535 AnneFrank</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:target:asteroid.25143_itokawa">25143 Itokawa</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:target:asteroid.101955_bennu">101955 Bennu</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:target:asteroid.162173_ryugu">162173 Ryugu</a></li>
                </ul>
            <li><h3>Comets</h3></li>
                <ul>
                    <li><a href="?identifier=urn:nasa:pds:context:target:comet.9p_tempel_1">9P Tempel 1</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:target:comet.19p_borrelly">19P Borrelly</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:target:comet.67p_churyumov-gerasimenko">67P Churyumov-Gerasimenko</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:target:comet.81p_wild_2">81P Wild 2</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:target:comet.103p_hartley_2">103P Hartley 2</a></li>
                </ul>
                </ul>
            </section>
            
            <section>
            <h2>Spacecraft</h2>
                <ul>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.a17c">Apollo 17</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.co">Cassini Orbiter</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.dawn">Dawn</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.grail-a">Gravity Recovery and Interior Laboratory A (GRAIL Ebb)</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.grail-b">Gravity Recovery and Interior Laboratory B (GRAIL Flow)</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.hay">Hayabusa</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.hp">Huygens Probe</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.insight">InSight</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.ladee"> Lunar Atmosphere and Dust Environment Explorer (LADEE)</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.lp">Lunar Prospector</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.lro">Lunar Reconnaissance Orbiter (LRO)</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.lcross">Lunar Crater Observation and Sensing Satellite (LCROSS)</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.mr6">Mariner 6</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.mr7">Mariner 7</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.mr9">Mariner 9</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.mer1">Mars Exploration Rover - Opportunity</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.mer2">Mars Exploration Rover - Spirit</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.mgs">Mars Global Surveyor</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.mo">Mars Observer</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.ody">Mars Odyssey</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.mpfl">Mars Pathfinder Lander</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.mpfr">Mars Pathfinder Rover (Sojourner)</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.mro">Mars Reconnaissance Orbiter</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.msl">Mars Science Laboratory (Curiosity)</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.near">Near Earth Asteroid Rendezvous (NEAR Shoemaker)</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.orex">Origins, Spectral Interpretation, Resource Identification, Security, Regolith Explorer (OSIRIS-REx)</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.p11">Pioneer 11</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.phx">Phoenix</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.vl1">Viking Lander 1</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.vl2">Viking Lander 2</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.vo1">Viking Orbiter 1</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.vo2">Viking Orbiter 2</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.vg1">Voyager 1</a></li>
                    <li><a href="?identifier=urn:nasa:pds:context:instrument_host:spacecraft.vg2">Voyager 2</a></li>
                </ul>
            </section>
            
            <section>
            <h2>Datasets</h2>
                <ul>
                    <li><a href="?identifier=urn:nasa:pds:orex.ocams">OSIRIS-REx OCAMS Bundle</a></li>
                    <li><a href="?identifier=urn:nasa:pds:apollodoc">Apollo Documents Bundle</a></li>
                    <li><a href="?identifier=urn:nasa:pds:insight_cameras">InSight Cameras Bundle</a></li>
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
