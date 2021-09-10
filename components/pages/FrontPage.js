import { Box, Container, Grid, IconButton, InputAdornment, makeStyles, TextField, ThemeProvider, Typography } from '@material-ui/core'
import SendIcon from '@material-ui/icons/Send'
import { ContextList } from 'components/ContextLinks'
import GlobalContext from 'components/contexts/GlobalContext'
import DarkTheme from 'DarkTheme'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'

// DAWN, Hayabusa, Hayabusa 2, NEAR, OREX, New horizons, Rosetta, Deep Impact
const missions = [
    {
        identifier: 'urn:nasa:pds:context:investigation:mission.orex',
        title: 'OSIRIS-REx'
    },
    {
        identifier: 'urn:nasa:pds:context:investigation:mission.dawn_mission_to_vesta_and_ceres',
        title: 'Dawn'
    },
    {
        identifier: 'urn:nasa:pds:context:investigation:mission.near_earth_asteroid_rendezvous',
        title: 'NEAR'
    },
    // {
    //     identifier: 'urn:nasa:pds:context:investigation:mission.deep_impact',
    //     title: 'Deep Impact'
    // },
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
        identifier: 'urn:esa:psa:context:investigation:mission.international_rosetta_mission',
        title: 'Rosetta'
    },
]

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
    {
        identifier: 'urn:nasa:pds:context:target:dwarf_planet.134340_pluto',
        title: 'Pluto'
    },
]

const useStyles = makeStyles((theme) => ({
    pageContainer: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4)
    },
    lidField: {
        width: '100%',
    },
    appTitle: {
        fontSize: '2rem',
        textAlign: 'center',
        width: '100%',
        [theme.breakpoints.up('md')]: {
            fontSize: '3.5rem'
        },
    },
    img: {
        maxWidth: '150px',
        
        [theme.breakpoints.up('md')]: {
            maxWidth: '200px'
        },
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
        <ThemeProvider theme={DarkTheme}>
            <GlobalContext>
                <Starfield/>
                <div className={classes.pageContainer}>
                    <Grid container direction="row" alignItems="center" justify="center" style={{ minHeight: '80vh' }}>
                        <Grid item md={6} xs={12} component="header">
                            <Box m={6}>
                                <Grid container direction="row" alignItems="center" justify="center" spacing={3}>
                                    <Grid item xs={6} component="img" src="/images/pds.svg" alt="PDS Logo" className={classes.img} />
                                    <Grid item xs={6} component="img" src="/images/sbn.png" alt="SBN Logo" className={classes.img} />
                                    <Typography xs={12} variant="h1" className={classes.appTitle}>Archive Navigator</Typography>
                                </Grid>
                            </Box>
                        </Grid>
                        <Grid item md={6} xs={12}  component="main">
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
            </GlobalContext>
        </ThemeProvider>
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

        return function cleanup() {
            window.removeEventListener('resize', resizeCanvas)
            window.removeEventListener('orientationchange', resizeCanvas, false)
        }
    }, [])

    return <canvas className={classes.starfield} width="1000" height="1000" id="starfield" ref={canvas}></canvas>
}


function LIDField() {
    const classes = useStyles()
    const router = useRouter()
    const [lid, setLid] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
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