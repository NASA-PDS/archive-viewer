import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import createEmotionServer from '@emotion/server/create-instance';
import createEmotionCache from 'services/createEmotionCache';

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
                
                <link rel="apple-touch-icon" sizes="180x180" href="images/favicon/apple-icon-180x180.png"/>
                <link rel="icon" type="image/png" sizes="32x32" href="images/favicon/favicon-32x32.png"/>
                <link rel="icon" type="image/png" sizes="16x16" href="images/favicon/favicon-16x16.png"/>
                
                <script src="https://pds.nasa.gov/pds-app-bar/pds-app-bar.js"></script>
                <link rel="stylesheet" href="https://pds.nasa.gov/pds-app-bar/pds-app-bar.css"  type="text/css" media="screen" />
                {/* Inject MUI styles first to match with the prepend: true configuration. */}
                {this.props.emotionStyleTags}
            </Head>
            <body>
                <Main />
                <NextScript />
                <script type="text/javascript" src="https://sbn.psi.edu/sbn-bar/sbn-bar.js"></script>
            </body>
            </Html>
        )
    }

    static async getInitialProps(ctx) {
        const originalRenderPage = ctx.renderPage;

        // You can consider sharing the same Emotion cache between all the SSR requests to speed up performance.
        // However, be aware that it can have global side effects.
        const cache = createEmotionCache();
        const { extractCriticalToChunks } = createEmotionServer(cache);

        ctx.renderPage = () =>
            originalRenderPage({
                enhanceApp: (App) => function EnhanceApp(props) {
                    return <App emotionCache={cache} {...props} />;
                },
            });

        const initialProps = await Document.getInitialProps(ctx);
        // This is important. It prevents Emotion from rendering invalid HTML.
        // See https://github.com/mui/material-ui/issues/26561#issuecomment-855286153
        const emotionStyles = extractCriticalToChunks(initialProps.html);
        const emotionStyleTags = emotionStyles.styles.map((style) => (
            <style
                data-emotion={`${style.key} ${style.ids.join(' ')}`}
                key={style.key}
                dangerouslySetInnerHTML={{ __html: style.css }}
            />
        ));

        return {
            ...initialProps,
            emotionStyleTags,
        };
    }
}

export default MyDocument;