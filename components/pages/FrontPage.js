import { Box, Container, IconButton, InputAdornment, TextField, Typography } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import Grid from '@mui/material/Grid2'
import { styled } from '@mui/material/styles'
import SendIcon from '@mui/icons-material/Send'
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

const PageContainer = styled('div')(({ theme }) => ({
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4)
}));

const LidField = styled(TextField)({
    width: '100%',
});

const AppTitle = styled(Typography)(({ theme }) => ({
    fontSize: '2rem',
    textAlign: 'center',
    width: '100%',
    [theme.breakpoints.up('md')]: {
        fontSize: '3.5rem'
    },
}));

const LogoImg = styled('img')(({ theme }) => ({
    maxWidth: '150px',
    [theme.breakpoints.up('md')]: {
        maxWidth: '200px'
    },
}));

const StarfieldCanvas = styled('canvas')({
    display: 'block',
    position: 'fixed',
    zIndex: -1,
    width: '100%',
    height: '100%'
});


export default function Index(props) {
    return (
        <ThemeProvider theme={DarkTheme}>
            <GlobalContext>
                <Starfield/>
                <PageContainer>
                    <Grid container direction="row" sx={{ alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                        <Grid size={{ xs: 12, md: 6 }} component="header">
                            <Box m={6}>
                                <Grid container direction="row" spacing={3} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                                    <Grid 
                                        size={6} 
                                        component="img" 
                                        src="/images/pds.svg" 
                                        alt="PDS Logo"
                                        sx={(theme) => ({
                                            maxWidth: '150px',
                                            [theme.breakpoints.up('md')]: {
                                                maxWidth: '200px'
                                            },
                                        })}
                                    />
                                    <Grid 
                                        size={6} 
                                        component="img" 
                                        src="/images/sbn.png" 
                                        alt="SBN Logo"
                                        sx={(theme) => ({
                                            maxWidth: '150px',
                                            [theme.breakpoints.up('md')]: {
                                                maxWidth: '200px'
                                            },
                                        })}
                                    />
                                    <AppTitle variant="h1">Archive Navigator</AppTitle>
                                </Grid>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }} component="main">
                            <Container>
                                <LIDFieldComponent />
                                <Grid container direction="row" sx={{ alignItems: 'flex-start' }}>
                                    <Grid size={6} component={ContextList} items={missions}/>
                                    <Grid size={6} component={ContextList} items={targets}/>
                                </Grid>
                            </Container>
                        </Grid>
                    </Grid>
                </PageContainer>
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

    return <StarfieldCanvas width="1000" height="1000" id="starfield" ref={canvas}/>
}


function LIDFieldComponent() {
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
            <LidField
                label="LID"
                placeholder="urn:nasa:pds"
                helperText="Enter a Logical Identifier"
                variant="outlined"
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