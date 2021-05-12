import { useTheme } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { LinearProgress } from '@material-ui/core'
import Menu from 'components/Menu'
import Router from "next/router"
import Footer from 'components/Footer'

function GlobalContext(props) {
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
            <Menu/>
            {props.children}
            { loading && <LinearProgress color="secondary" style={{position: 'fixed', bottom: 0, width: '100%'}}/>}
            <Footer/>
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
            `}</style>
        </>
    )
}
  
export default GlobalContext