import GlobalContext from 'components/contexts/GlobalContext'
import InternalLink from 'components/InternalLink'
import Themed from 'components/Themed'
import Link from 'next/link'
import { getTheme, setTheme } from 'services/pages'

export default function Index(props) {
    const theme = getTheme(props)
    return (
        <Themed {...props}>
            <GlobalContext>
                <div className="co-main">
                    <header className="co-header banner-header">
                        <img className="banner" src="images/front/solar_system-e1429031444824.jpg" alt="imgHeader" />
                        <h1 className="banner-title">PDS Archive Viewer</h1>
                    </header>
                    <div className="webinfo-content">
                        <p className="text-center">
                            This website was created to help find datasets for planetary bodies in one location.
                  </p>
                        <p className="text-center">
                            To search for a dataset, one can go to the Planetary Body page, Spacecraft page or Instrument page to see what datasets are available. Satellites can be found on their parent body page.
                  </p>
                        <p className="text-center">
                            When you select an item from the dropdown menu, it will bring you to the page of that Target.
                  </p>
                    </div>
                    <div className="row-front">
                        <div className="column-tar">
                            <section>
                                <h2>Targets</h2>
                                <ul className="front-page-list">
                                    <li>
                                        <h3>Planets</h3>
                                        <ul className="front-page-list">
                                            <li>
                                                <InternalLink identifier={"urn:nasa:pds:context:target:planet.mercury"}>Mercury</InternalLink>
                                            </li>
                                            <li>
                                                <InternalLink identifier={"urn:nasa:pds:context:target:planet.venus"}>Venus</InternalLink>
                                            </li>
                                            <li>
                                                <InternalLink identifier={"urn:nasa:pds:context:target:planet.earth"}>Earth</InternalLink>
                                                <ul><li><InternalLink identifier={"urn:nasa:pds:context:target:satellite.earth.moon"}>Moon</InternalLink></li></ul>
                                            </li>
                                            <li>
                                                <InternalLink identifier={"urn:nasa:pds:context:target:planet.mars"}>Mars</InternalLink>
                                            </li>
                                            <li>
                                                <InternalLink identifier={"urn:nasa:pds:context:target:planet.jupiter"}>Jupiter</InternalLink>
                                            </li>
                                            <li>
                                                <InternalLink identifier={"urn:nasa:pds:context:target:planet.saturn"}>Saturn</InternalLink>
                                            </li>
                                            <li>
                                                <InternalLink identifier={"urn:nasa:pds:context:target:planet.uranus"}>Uranus</InternalLink>
                                            </li>
                                            <li>
                                                <InternalLink identifier={"urn:nasa:pds:context:target:planet.neptune"}>Neptune</InternalLink>
                                            </li>
                                        </ul>
                                    </li>
                                    <li>
                                        <h3>Asteroids</h3>
                                        <ul className="front-page-list">
                                            <li>
                                                <Link href="/search/Targets/Near-Earth%20Asteroid">Near-Earth Asteroid</Link>
                                                <ul className="front-page-list"><li>e.g. 433 Eros</li></ul>
                                            </li>
                                            <li>
                                                <Link href="/search/Targets/Main%20Belt%20Asteroid">Main Belt Asteroid</Link>
                                                <ul className="front-page-list"><li>e.g. 4 Vesta</li></ul>
                                            </li>
                                            <li>
                                                <Link href="/search/Targets/Kuiper%20Belt%20Object">Kuiper Belt Object</Link>
                                                <ul className="front-page-list"><li>e.g. 486958 Arrokoth</li></ul>
                                            </li>
                                        </ul>
                                    </li>
                                    <li>
                                        <h3>Dwarf Planets</h3>
                                        <ul className="front-page-list">
                                            <li><InternalLink identifier={"urn:nasa:pds:context:target:dwarf_planet.1_ceres"}>1 Ceres</InternalLink></li>
                                            <li><InternalLink identifier={"urn:nasa:pds:context:target:dwarf_planet.134340_pluto"}>134340 Pluto</InternalLink></li>
                                        </ul>

                                        <h3>Comets</h3>
                                        <ul className="front-page-list">
                                            <li>
                                                <Link href="/search/Targets/Short-Period%20Comet">Short-Period Comets</Link>
                                                <ul className="front-page-list"><li>e.g. 9P Tempel 1</li></ul>
                                            </li>
                                            <li>
                                                <Link href="/search/Targets/Long-Period%20Comet">Long-Period Comets</Link>
                                                <ul className="front-page-list"><li>e.g. C/1996 B2 Hyakutake</li></ul>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            </section>
                        </div>
                        <div className="column-spc">
                            <section>
                                <h2>Spacecraft</h2>
                                <ul className="front-page-list">

                                    <li>
                                        <img className="sc-img" src="images/front/Orbiter.png" alt="imgOrb" /><Link href="/search/Spacecraft/Orbiter">Orbiter</Link>
                                        <ul className="front-page-list"><li>e.g. Mariner 9</li></ul>
                                    </li>

                                    <li>
                                        <img className="sc-img" src="images/front/Flyby.png" alt="imgFb" /><Link href="/search/Spacecraft/Flyby">Flyby</Link>
                                        <ul className="front-page-list"><li>e.g. Voyager 1</li></ul>
                                    </li>

                                    <li>
                                        <img className="sc-img" src="images/front/Lander.png" alt="imgLand" /><Link href="/search/Spacecraft/Lander">Lander</Link>
                                        <ul className="front-page-list"><li>e.g. Apollo 17 LSEP</li></ul>
                                    </li>

                                    <li>
                                        <img className="sc-img" src="images/front/Rover.png" alt="imgRov" /><Link href="/search/Spacecraft/Rover">Rover</Link>
                                        <ul className="front-page-list"><li>e.g. Mars Science Laboratory (Curiosity)</li></ul>
                                    </li>

                                    <li>
                                        <img className="sc-img" src="images/front/Impactor.png" alt="imgImpa" /><Link href="/search/Spacecraft/Impactor">Impactor</Link>
                                        <ul className="front-page-list"><li>e.g. Deep Impact Impactor</li></ul>
                                    </li>

                                    <li>
                                        <img className="sc-img" src="images/front/Sample_Return.png" alt="imgSaRe" /><Link href="/search/Spacecraft/Sample%20Return">Sample Return</Link>
                                        <ul className="front-page-list"><li>e.g. Stardust</li></ul>
                                    </li>

                                    <li>
                                        <img className="sc-img" src="images/front/Atmos_Probe.png" alt="imgAtPr" /><Link href="/search/Spacecraft/Atmospheric%20Probe">Atmospheric Probe</Link>
                                        <ul className="front-page-list"><li>e.g. Galileo Probe</li></ul>
                                    </li>
                                </ul>
                            </section>
                        </div>
                        <div className="column-spc">
                            <section>
                                <h2>Missions</h2>
                                <ul className="front-page-list">
                                    <li>
                                        <InternalLink identifier={"urn:nasa:pds:context:instrument_host:spacecraft.orex"}>OSIRIS-REx</InternalLink>
                                    </li>
                                    <li>
                                        <InternalLink identifier={"urn:nasa:pds:context:investigation:mission.cassini-huygens"}>Cassini-Huygens</InternalLink>
                                    </li>
                                    <li>
                                        <InternalLink identifier={"urn:nasa:pds:context:instrument_host:spacecraft.insight"}>InSight</InternalLink>
                                    </li>
                                    <li>
                                        <InternalLink identifier={"urn:nasa:pds:context:investigation:mission.international_rosetta_mission"}>Rosetta</InternalLink>
                                    </li>
                                    <li>
                                        <InternalLink identifier={"urn:nasa:pds:context:instrument_host:spacecraft.ladee"}>LADEE</InternalLink>
                                    </li>
                                    <li>
                                        <InternalLink identifier={"urn:nasa:pds:context:instrument_host:spacecraft.near"}>NEAR</InternalLink>
                                    </li>
                                    <li>
                                        <InternalLink identifier={"urn:nasa:pds:context:investigation:mission.dawn_mission_to_vesta_and_ceres"}>Dawn</InternalLink>
                                    </li>
                                    <li>
                                        <InternalLink identifier={"urn:nasa:pds:context:investigation:mission.new_horizons"}>New Horizons</InternalLink>
                                    </li>
                                    <li>
                                        <InternalLink identifier={"urn:nasa:pds:context:investigation:mission.hayabusa"}>Hayabusa</InternalLink>
                                    </li>
                                    <li>
                                        <InternalLink identifier={"urn:jaxa:darts:context:investigation:mission.hyb2"}>Hayabusa2</InternalLink>
                                    </li>
                                    <li>
                                        <InternalLink identifier={"urn:nasa:pds:context:investigation:mission.deep_impact"}>Deep Impact</InternalLink>
                                    </li>
                                </ul>
                            </section>
                        </div>
                    </div>
                </div>

                <style jsx global>{`
                a {
                    cursor: pointer;
                    color: ${theme.palette.primary.main};
                    text-decoration: none;
                }
            `}</style>
            </GlobalContext>
        </Themed>
    )
}

// redirect previous URL formats (lid as query string parameter) to new address
export async function getServerSideProps(context) {
    const { query, res } = context
    let { identifier, dataset, target, instrument, mission, spacecraft, ...otherQueries } = query

    identifier = identifier || dataset || target || instrument || mission || spacecraft

    if (!!identifier) {
        const combined = Object.keys(otherQueries).map(q => `${q}=${otherQueries[q]}`).join('&')
        res.setHeader('Location', `/${identifier}${combined ? '?' + combined : combined}`);
        res.statusCode = 301;
    }

    let props = {}
    setTheme(props, context)
    return { props }

}
