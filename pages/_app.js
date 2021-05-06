import React, { useEffect, useState } from 'react'
import 'css/FrontPage.scss'
import 'css/main.scss'
import { ThemeProvider } from '@material-ui/core/styles'
import DarkTheme from 'DarkTheme'
import LightTheme from 'LightTheme'
import AppBar from 'components/Banner'
import 'fontsource-roboto'
import { LinearProgress } from '@material-ui/core'
import Router from "next/router"
import Menu  from 'components/Menu'
import * as cookie from 'cookie'
import App from "next/app"

export default function MyApp({ Component, pageProps, theme }) {
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
    <ThemeProvider theme={theme || DarkTheme}>
        {/* <AppBar/> */}
        <Menu/>
        { loading && <LinearProgress color="secondary" style={{position: 'fixed', bottom: 0, width: '100%'}}/>}
        <Component {...pageProps} />
        <script type="text/javascript" src="https://sbn.psi.edu/sbn-bar/sbn-bar.js"></script>
    </ThemeProvider>
    )
}

MyApp.getServerSideProps = async (context) => {
    const cookies = cookie.parse(context.req.headers.cookie)
    console.log(cookies)
    const theme = cookies.SBNTHEME === 'light' ? LightTheme : DarkTheme

    let props = App.getServerSideProps(context)
    props.theme = theme
    return props
}