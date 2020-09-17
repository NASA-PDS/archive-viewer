import React from 'react';
export default function Index() {
    return (
        <div>

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
                                            <a href="?identifier=urn:nasa:pds:context:target:planet.mercury">Mercury</a>
                                        </li>
                                        <li>
                                            <a href="?identifier=urn:nasa:pds:context:target:planet.venus">Venus</a>
                                        </li>
                                        <li>
                                            <a href="?identifier=urn:nasa:pds:context:target:planet.earth">Earth</a>
                                            <ul><li><a href="?identifier=urn:nasa:pds:context:target:satellite.earth.moon">Moon</a></li></ul>
                                        </li>
                                        <li>
                                            <a href="?identifier=urn:nasa:pds:context:target:planet.mars">Mars</a>
                                        </li>
                                        <li>
                                            <a href="?identifier=urn:nasa:pds:context:target:planet.jupiter">Jupiter</a>
                                        </li>
                                        <li>
                                            <a href="?identifier=urn:nasa:pds:context:target:planet.saturn">Saturn</a>
                                        </li>
                                        <li>
                                            <a href="?identifier=urn:nasa:pds:context:target:planet.uranus">Uranus</a>
                                        </li>
                                        <li>
                                            <a href="?identifier=urn:nasa:pds:context:target:planet.neptune">Neptune</a>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <h3>Asteroids</h3>
                                    <ul className="front-page-list">
                                        <li>
                                            <a href="https://sbnarchivedemo.psi.edu/?tag=Near-Earth%20Asteroid&type=target">Near-Earth Asteroid</a>
                                            <ul className="front-page-list"><li>e.g. 433 Eros</li></ul>
                                        </li>
                                        <li>
                                            <a href="https://sbnarchivedemo.psi.edu/?tag=Main%20Belt%20Asteroid&type=target">Main Belt Asteroid</a>
                                            <ul className="front-page-list"><li>e.g. 4 Vesta</li></ul>
                                        </li>
                                        <li>
                                            <a href="https://sbnarchivedemo.psi.edu/?tag=Kuiper%20Belt%20Object&type=target">Kuiper Belt Object</a>
                                            <ul className="front-page-list"><li>e.g. 486958 Arrokoth</li></ul>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <h3>Dwarf Planets</h3>
                                    <ul className="front-page-list">
                                        <li><a href="?identifier=urn:nasa:pds:context:target:dwarf_planet.1_ceres">1 Ceres</a></li>
                                        <li><a href="?identifier=urn:nasa:pds:context:target:dwarf_planet.134340_pluto">134340 Pluto</a></li>
                                    </ul>
                                    
                                    <h3>Comets</h3>
                                    <ul className="front-page-list">
                                        <li>
                                            <a href="https://sbnarchivedemo.psi.edu/?tag=Short-Period%20Comet&type=target">Short-Period Comets</a>
                                            <ul className="front-page-list"><li>e.g. 9P Tempel 1</li></ul>
                                        </li>
                                        <li>
                                            <a href="https://sbnarchivedemo.psi.edu/?tag=Long-Period%20Comet&type=target">Long-Period Comets</a>
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
                                    <img className="sc-img" src="images/front/Orbiter.png" alt="imgOrb" /><a href="?tag=Orbiter&type=spacecraft">Orbiter</a>
                                    <ul className="front-page-list"><li>e.g. Mariner 9</li></ul>
                                </li>

                                <li>
                                    <img className="sc-img" src="images/front/Flyby.png" alt="imgFb" /><a href="?tag=Flyby&type=spacecraft">Flyby</a>
                                    <ul className="front-page-list"><li>e.g. Voyager 1</li></ul>
                                </li>

                                <li>
                                    <img className="sc-img" src="images/front/Lander.png" alt="imgLand" /><a href="?tag=Lander&type=spacecraft">Lander</a>
                                    <ul className="front-page-list"><li>e.g. Apollo 17 LSEP</li></ul>
                                </li>

                                <li>
                                    <img className="sc-img" src="images/front/Rover.png" alt="imgRov" /><a href="?tag=Rover&type=spacecraft">Rover</a>
                                    <ul className="front-page-list"><li>e.g. Mars Science Laboratory (Curiosity)</li></ul>
                                </li>

                                <li>
                                    <img className="sc-img" src="images/front/Impactor.png" alt="imgImpa" /><a href="?tag=Impactor&type=spacecraft">Impactor</a>
                                    <ul className="front-page-list"><li>e.g. Deep Impact Impactor</li></ul>
                                </li>

                                <li>
                                    <img className="sc-img" src="images/front/Sample_Return.png" alt="imgSaRe" /><a href="?tag=Sample%20Return&type=spacecraft">Sample Return</a>
                                    <ul className="front-page-list"><li>e.g. Stardust</li></ul>
                                </li>

                                <li>
                                    <img className="sc-img" src="images/front/Atmos_Probe.png" alt="imgAtPr" /><a href="?tag=Atmospheric%20Probe&type=spacecraft">Atmospheric Probe</a>
                                    <ul className="front-page-list"><li>e.g. Galileo Probe</li></ul>
                                </li>
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}