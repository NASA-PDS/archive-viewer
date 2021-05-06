import { LinearProgress, ThemeProvider } from '@material-ui/core'
import Menu from 'components/Menu'
import 'css/FrontPage.scss'
import 'css/main.scss'
import DarkTheme from 'DarkTheme'
import 'fontsource-roboto'
import Router from "next/router"
import React, { useEffect, useState } from 'react'

function MyApp({ Component, pageProps }) {
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // remove the server-side injected CSS
        const jssStyles = document.querySelector('#jss-server-side')
        if (!!jssStyles) {
          jssStyles.parentElement.removeChild(jssStyles)
        }

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
    <ThemeProvider theme={DarkTheme}>
        {/* <AppBar/> */}
        <Menu/>
        { loading && <LinearProgress color="secondary" style={{position: 'fixed', bottom: 0, width: '100%'}}/>}
        <Component {...pageProps} />
        <script type="text/javascript" src="https://sbn.psi.edu/sbn-bar/sbn-bar.js"></script>
    </ThemeProvider>
    )
}

export default MyApp