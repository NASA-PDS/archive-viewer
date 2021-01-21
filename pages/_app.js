import React from 'react';
import 'css/FrontPage.scss'
import 'css/main.scss';
import { ThemeProvider } from '@material-ui/core/styles';
import Theme from 'Theme';
import AppBar from 'components/Banner'
import 'fontsource-roboto'

export default function MyApp({ Component, pageProps }) {

    React.useEffect(() => {
        // Remove the server-side injected CSS.
        const jssStyles = document.querySelector('#jss-server-side');
        if (jssStyles) {
          jssStyles.parentElement.removeChild(jssStyles);
        }
    }, []);

    return (
    <ThemeProvider theme={Theme}>
        <AppBar/>
        <Component {...pageProps} />
    </ThemeProvider>
    )
}