import { ThemeProvider } from '@material-ui/core'
import DarkTheme from 'DarkTheme'
import React from 'react'

function GlobalContext(props) {
    return (
        <ThemeProvider theme={DarkTheme}>
            {props.children}
            <style jsx global>{`
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Roboto', sans-serif;
                }
                html, body, main {
                    min-height: 100vh;
                }
                #__next {
                    height: 100%;
                }
            `}</style>
        </ThemeProvider>
    )
}
  
export default GlobalContext