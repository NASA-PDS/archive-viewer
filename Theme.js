import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles';

const Theme = createMuiTheme({
    spacing: 8,
    palette: {
        type: 'dark',
        primary: {
            main: "#B5DCFB",
            dark: "#57B4FF",
            light: "#D5EBFD"
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
        text: {
            primary: "#FDFDFD",
            secondary: "rgba(253,253,253,0.54)",
            disabled: "rgba(253,253,253,0.38)"
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
            default: "#12181D",
            paper: "#282F36"
        }
    },
    typography: {
        h1: {
            fontSize: '2.5rem'
        },
        h2: {
            fontSize: '2rem'
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
    overrides: {
        MuiAccordionSummary: {
            root: { 
                backgroundColor: "#192028"
            }
        }
    },
    props: {
        MuiLink: {
            underline: 'none'
        }
    },
    custom: {
        header: {
            height: {
                sm: '115px',
                md: '200px'
            },
        }
    }
});

export default responsiveFontSizes(Theme);