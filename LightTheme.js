import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles';

const LightTheme = createMuiTheme({
    spacing: 8,
    palette: {
        type: 'light',
        primary: {
            main: "#0A6BB9",
            light: "#57B4FF"
        },
        secondary: {
            main: "#A5FBE2",
            dark: "#68E1AC",
            light: "#8AF4D4"
        },
        error: {
            main: "#F44336",
            light: "#F88078",
            dark: "#E3B10C"
        },
        info: {
            main: "#2398F4",
            dark: "#0B7ED9",
            light: "#64B6F7"
        },
        grey: {
            0: "#FFFFFF",
            50: "#FDFDFD",
            100: "#EEEEEF",
            200: "#DEDFE0",
            300: "#C0C2C4",
            400: "#888B8E",
            500: "#656A6F",
            600: "#474C53",
            700: "#282F36",
            800: "#192028",
            900: "#12181D"
        },
        background: {
            default: "#FFFFFF",
            paper: "#EEEEEF"
        }
    },
    typography: {
        h1: {
            fontSize: '2.5rem',
            marginTop: 24,
            marginBottom: 24
        },
        h2: {
            fontSize: '2rem',
            marginTop: 24,
            marginBottom: 16
        },
        h3: {
            fontSize: '1.5rem',
            marginTop: 16,
            marginBottom: 12
        },
        h4: {
            fontSize: '1.3rem',
            marginTop: 16,
            marginBottom: 12
        },
        h5: {
            fontSize: '1.3rem',
        },
        h6: {
            fontSize: '1.3rem',
        },
    },
    overrides: {
        MuiTypography: {
            root: {
                color: "#12181D",
            }
        },
        MuiTab: {
            root: {
                color: '#FDFDFD'
            }
        }
    },
    props: {
        MuiLink: {
            underline: 'none'
        }
    },
    custom: {
        headerBanner: {
            height: {
                sm: '115px',
                md: '200px'
            },
        },
        targetThemeColor: '#000000',
        missionThemeColor: '#085898',
        paperTitle: '#FFFFFF'
    }
});

export default responsiveFontSizes(LightTheme);