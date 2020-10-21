import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles';

const Theme = createMuiTheme({
    spacing: 8,
    palette: {
        primary: {
            main: "#2196F3",
            light: "#64B6F7",
            dark: "#0B79D0"
        },
        secondary: {
            main: "#E91E63",
            light: "#F06191",
            dark: "#BE134D"
        },
        error: {
            main: "#F44336",
            light: "#F88078",
            dark: "#E3B10C"
        }
    },
    typography: {
        fontFamily: "'Noto Sans', 'Helvetical', 'Arial', sans-serif",
        h1: {
            fontSize: '2rem'
        },
        h2: {
            fontSize: '1.7rem'
        },
        h3: {
            fontSize: '1.5rem'
        },
        h4: {
            fontSize: '1.3rem'
        },
        h5: {
            fontSize: '1.3rem'
        },
        h6: {
            fontSize: '1.3rem'
        },
    },
});

export default responsiveFontSizes(Theme);