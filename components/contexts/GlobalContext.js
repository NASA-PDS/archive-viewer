import { LinearProgress, Snackbar, useTheme } from '@mui/material'
import { Alert } from '@mui/material';
import Footer from 'components/Footer'
import Router from "next/router"
import React, { useEffect, useState } from 'react'

function GlobalContext(props) {
    const [warningDismissed, setWarningDismissed] = useState(false)
    const [loading, setLoading] = useState(false)
    const theme = useTheme()

    useEffect(() => {
        // app-wide loading
        const start = () => {
            setLoading(true)
        }
        const end = () => {
            setLoading(false)
        }
        Router.events.on("routeChangeStart", start)
        Router.events.on("routeChangeComplete", end)
        Router.events.on("routeChangeError", end)

        return function cleanup() {
            Router.events.off("routeChangeStart", start)
            Router.events.off("routeChangeComplete", end)
            Router.events.off("routeChangeError", end)
        }
    }, [])

    return (
        <>
            {/* <AppBar/> */}
            {props.children}
            { loading && <LinearProgress color="secondary" style={{position: 'fixed', bottom: 0, width: '100%'}}/>}
            <Footer/>
            <Snackbar open={props.backupMode && !warningDismissed} >
                <Alert severity="warning" onClose={() => setWarningDismissed(true)}>
                    This application is experiencing a service disruption. Functionality might be limited.
                </Alert>
            </Snackbar>
            <style jsx global>{`
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Roboto', sans-serif;
                    background-color: ${theme.palette.background.default};
                    color: ${theme.palette.text.primary}
                }
                html, body {
                    min-height: 100vh;
                }
                #__next {
                    min-height: 80vh;
                }
                #pds-app-bar {
                    z-index: 100;
                    border-bottom: none;
                }
            `}</style>
        </>
    )
}

export default GlobalContext