import 'fontsource-roboto'
import Head from 'next/head'
import React, { useEffect } from 'react'

// Set up logging
import betterLogging, {Theme} from 'better-logging'

if(process.env.NEXT_PUBLIC_BETTER_LOGGING?.toLocaleLowerCase() !== 'off') {
    betterLogging(console, {
        color: Theme.dark,
        format: ctx => `${ctx.date} ${ctx.time12} ${ctx.type} ${ctx.msg}`
    })
}

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
            <title>Archive Navigator | NASA PDS SBN</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        <Component {...pageProps} />
    </>
    )
}

export default MyApp