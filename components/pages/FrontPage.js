import { Box, Container, Grid, IconButton, InputAdornment, makeStyles, TextField, Typography } from '@material-ui/core'
import GlobalContext from 'components/contexts/GlobalContext'
import InternalLink from 'components/InternalLink'
import Themed from 'components/Themed'
import { ContextList } from 'components/ContextLinks'
import Link from 'next/link'
import { getTheme, setTheme } from 'services/pages'
import SendIcon from '@material-ui/icons/Send'
import TangentAccordion from 'components/TangentAccordion'
import { useRouter } from 'next/router'
import { SettingsOutlined, ViewStream } from '@material-ui/icons'
import { useEffect, useRef, useState } from 'react'

// DAWN, Hayabusa, Hayabusa 2, NEAR, OREX, New horizons, Rosetta, Deep Impact
const missions = [
    {
        identifier: 'urn:nasa:pds:context:instrument_host:spacecraft.orex',
        title: 'OSIRIS-REx'
    },
    {
        identifier: 'urn:nasa:pds:context:investigation:mission.dawn_mission_to_vesta_and_ceres',
        title: 'Dawn'
    },
    {
        identifier: 'urn:nasa:pds:context:instrument_host:spacecraft.near',
        title: 'NEAR'
    },
    {
        identifier: 'urn:nasa:pds:context:investigation:mission.deep_impact',
        title: 'Deep Impact'
    },
    {
        identifier: 'urn:nasa:pds:context:investigation:mission.new_horizons',
        title: 'New Horizons'
    },
    {
        identifier: 'urn:nasa:pds:context:investigation:mission.hayabusa',
        title: 'Hayabusa'
    },
    {
        identifier: 'urn:jaxa:darts:context:investigation:mission.hyb2',
        title: 'Hayabusa 2'
    },
    {
        identifier: 'urn:nasa:pds:context:investigation:mission.international_rosetta_mission',
        title: 'Rosetta'
    },
]

// Bennu
// Ceres
// Vesta
// Itokawa
// Ryugu
// 67P
// Eros
const targets = [
    {
        identifier: 'urn:nasa:pds:context:target:asteroid.101955_bennu',
        title: 'Bennu'
    },
    {
        identifier: 'urn:nasa:pds:context:target:dwarf_planet.1_ceres',
        title: 'Ceres'
    },
    {
        identifier: 'urn:nasa:pds:context:target:asteroid.4_vesta',
        title: 'Vesta'
    },
    {
        identifier: 'urn:nasa:pds:context:target:asteroid.433_eros',
        title: 'Eros'
    },
    {
        identifier: 'urn:nasa:pds:context:target:asteroid.25143_itokawa',
        title: 'Itokawa'
    },
    {
        identifier: 'urn:nasa:pds:context:target:asteroid.162173_ryugu',
        title: 'Ryugu'
    },
    {
        identifier: 'urn:nasa:pds:context:target:comet.67p_churyumov-gerasimenko',
        title: '67P'
    },
]

const useStyles = makeStyles((theme) => ({
    pageContainer: {
        // background: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F)'
    },
    lidField: {
        width: '100%',
    },
    appTitle: {
        fontSize: '3.5rem'
    },
    img: {
        maxWidth: '200px'
    },
    starfield: {
        display: 'block',
        position: 'fixed',
        zIndex: -1,
        width: '100%',
        height: '100%'
    }
}));


export default function Index(props) {
    const classes = useStyles()
    return (
        <Themed {...props}>
            <GlobalContext>
                <Starfield/>
                <div className={classes.pageContainer}>
                    <Grid container spacing={10} direction="row" alignItems="center" justifyContent="center" style={{ width: '100%', minHeight: '80vh' }}>
                        <Grid item xs={6} component="header">
                            <Box mx={6}>
                                <Grid container direction="row" alignItems="center" spacing={3}>
                                    <Grid item xs={6} component="img" src="/images/pds.svg" alt="PDS Logo" className={classes.img} />
                                    <Grid item xs={6} component="img" src="/images/sbn.png" alt="SBN Logo" className={classes.img} />
                                    <Typography xs={12} variant="h1" className={classes.appTitle}>Archive Navigator</Typography>
                                </Grid>
                            </Box>
                        </Grid>
                        <Grid item xs={6} component="main">
                            <Container>
                                <LIDField />
                                <Grid container direction="row" alignItems="flex-start">
                                    <Grid item xs={6} component={ContextList} items={missions}/>
                                    <Grid item xs={6} component={ContextList} items={targets}/>
                                </Grid>
                            </Container>
                        </Grid>
                    </Grid>
                </div>
                <style jsx global>{`
                    html {
                        background: radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%);
                    }
                    body {
                        background: none !important;
                    }
                `}</style>
                <TemporaryLinks {...props}/>
            </GlobalContext>
        </Themed>
    )
}

function Starfield() {
    const classes = useStyles()
    const canvas = useRef(null)
    if(!canvas && !canvas.current) return

    useEffect(() => {
        var context = canvas.current.getContext("2d"),
            stars = 500;
            
        function resizeCanvas() {
            canvas.current.width = window.innerWidth;
            canvas.current.height = window.innerHeight;
            // console.log(document.documentElement.scrollHeight);
            draw();
        }
    
        function draw() {
            context.clearRect(0, 0, canvas.current.width, canvas.current.height);
            for (var i = 0; i < stars; i++) {
                var x = Math.random() * canvas.current.offsetWidth,
                y = Math.random() * canvas.current.offsetHeight,
                radius = Math.random() * 1.2;
                context.beginPath();
                context.arc(x, y, radius, 0, 360);
                context.fillStyle = "hsla(200,100%,50%,0.8)";
                context.fill();
            }
        }
        
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('orientationchange', resizeCanvas, false);
    
        resizeCanvas();
    }, [])

    return <canvas className={classes.starfield} width="1000" height="1000" id="starfield" ref={canvas}></canvas>
}

function TemporaryLinks(props) {
    const theme = getTheme(props)
    return <TangentAccordion title="These links are going away soon">
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
        <style jsx global>{`
            a {
                cursor: pointer;
                color: ${theme.palette.primary.main};
                text-decoration: none;
            }
        `}</style>
    </TangentAccordion>
}

function LIDField() {
    const classes = useStyles()
    const router = useRouter()
    const [lid, setLid] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // app-wide loading
        const start = (url, other) => {
            const destination = url ? url.split('/')[1] : ''
            setLid(destination)
            setLoading(true)
        }
        const end = () => {
            setLoading(false)
        }
        router.events.on("routeChangeStart", start)
        router.events.on("routeChangeComplete", end)
        router.events.on("routeChangeError", end)

        return function cleanup() {
            router.events.off("routeChangeStart", start)
            router.events.off("routeChangeComplete", end)
            router.events.off("routeChangeError", end)
        }
    }, [])


    const handleChange = (event) => {
        setLid(event.target.value)
    }
    const visitLid = (event) => {
        event.preventDefault()
        router.push('/' + lid)
    }

    return (
        <form noValidate autoComplete="off" onSubmit={visitLid}>
            <TextField
                label="LID"
                placeholder="urn:nasa:pds"
                helperText="Enter a Logical Identifier"
                variant="outlined"
                className={classes.lidField}
                value={lid}
                onChange={handleChange}
                disabled={loading}
                InputProps={{
                    endAdornment: <InputAdornment position="end">
                        <IconButton aria-label="View product" onClick={visitLid} disabled={!lid || loading}><SendIcon/></IconButton>
                    </InputAdornment>,
                }} />
        </form>
    )
}