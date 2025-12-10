import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Head from 'next/head';
import React from 'react';
import { CacheProvider } from '@emotion/react';
import createEmotionCache from 'services/createEmotionCache';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

function MyApp({ Component, emotionCache = clientSideEmotionCache, pageProps }) {
    return (
    <CacheProvider value={emotionCache}>
        <Head>
            <title>Archive Navigator | NASA PDS SBN</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        <Component {...pageProps} />
    </CacheProvider>
    )
}

export default MyApp