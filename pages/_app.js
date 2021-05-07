import 'css/FrontPage.scss'
import 'css/main.scss'
import 'fontsource-roboto'
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
        <Component {...pageProps} />
        <script type="text/javascript" src="https://sbn.psi.edu/sbn-bar/sbn-bar.js"></script>
    </>
    )
}

export default MyApp