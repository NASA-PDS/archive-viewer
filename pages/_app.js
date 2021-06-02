import 'fontsource-roboto'
import Head from 'next/head'
import React, { useEffect } from 'react'

function MyApp({ Component, pageProps }) {

    useEffect(() => {
        // remove the server-side injected CSS
        const jssStyles = document.querySelector('#jss-server-side')
        if (!!jssStyles) {
          jssStyles.parentElement.removeChild(jssStyles)
        }
    }, [])


    return (
    <>
        <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        <Component {...pageProps} />
    </>
    )
}

export default MyApp