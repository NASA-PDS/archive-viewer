import React, { useEffect, useState } from 'react';
import 'css/FrontPage.scss'
import 'css/main.scss';
import { ThemeProvider } from '@material-ui/core/styles';
import Theme from 'Theme';
import AppBar from 'components/Banner'
import 'fontsource-roboto'
import { LinearProgress } from '@material-ui/core';
import Router from "next/router";

export default function MyApp({ Component, pageProps }) {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Remove the server-side injected CSS.
        const jssStyles = document.querySelector('#jss-server-side');
        if (jssStyles) {
          jssStyles.parentElement.removeChild(jssStyles);
        }
    }, []);

    useEffect(() => {
        const start = () => {
            setLoading(true);
        };
        const end = () => {
            setLoading(false);
        };
        Router.events.on("routeChangeStart", start);
        Router.events.on("routeChangeComplete", end);
        Router.events.on("routeChangeError", end);
        return () => {
            Router.events.off("routeChangeStart", start);
            Router.events.off("routeChangeComplete", end);
            Router.events.off("routeChangeError", end);
        };
    }, []);


    return (
    <ThemeProvider theme={Theme}>
        <AppBar/>
        { loading && <LinearProgress color="secondary" style={{position: 'absolute', width: '100%'}}/>}
        <Component {...pageProps} />
    </ThemeProvider>
    )
}