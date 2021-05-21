import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document'
import { ServerStyleSheets } from '@material-ui/core/styles';

class MyDocument extends Document {
    
    render() {
        return (
            <Html>
            <Head>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"/>
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
                <script src='https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit' async defer></script>
                <link rel="stylesheet" href="/feedback/css/feedback.css"  type="text/css" media="screen" />
                <script src="/feedback/js/modernizr-custom.js"></script>
                <script src="/feedback/js/config.js"></script>
                <script src="/feedback/js/feedback.js"></script>
                
                <script src="https://pds.nasa.gov/pds-app-bar/pds-app-bar.js"></script>
                <link rel="stylesheet" href="https://pds.nasa.gov/pds-app-bar/pds-app-bar.css"  type="text/css" media="screen" />
                
            </Head>
            <body>
                <Main />
                <NextScript />
                <script type="text/javascript" src="https://sbn.psi.edu/sbn-bar/sbn-bar.js"></script>
                <style jsx global>{`
                        #pds-app-bar {
                            z-index: 100;
                            border-bottom: none;
                        }
                    `}</style>
            </body>
            </Html>
        )
    }

    static async getInitialProps(ctx) {
        // Render app and page and get the context of the page with collected side effects.
        const sheets = new ServerStyleSheets();
        const originalRenderPage = ctx.renderPage;

        ctx.renderPage = () =>
            originalRenderPage({
            enhanceApp: (App) => (props) => sheets.collect(<App {...props} />),
            });

        const initialProps = await Document.getInitialProps(ctx);

        return {
            ...initialProps,
            // Styles fragment is rendered after the app and page rendering finish.
            styles: [...React.Children.toArray(initialProps.styles), sheets.getStyleElement()],
        };
    }
}

export default MyDocument