import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const DarkTheme = (outerTheme) => createTheme({
    ...outerTheme,
    spacing: 8,
    palette: {
        ...outerTheme.palette,
        mode: 'dark',
        primary: {
            main: "#B5DCFB",
            dark: "#57B4FF",
            light: "#D5EBFD"
        },
        background: {
            default: "#12181D",
            paper: "#282F36"
        }
    },
    components: {
        ...outerTheme.components,
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none' // this is, for some reason, needed to override the coloring that happens on elevated paper surfaces
                }   
            }
        }
    },
    custom: {
        ...outerTheme.custom,
        raisedContent: "#474C53",
        raisedContentHover: "#656A6F",
        externalLinkLocation: '/images/external.svg',
        insetShadowTop: 'inset 0 1px 3px rgba(255, 255, 255, 0.08)',
        insetShadowBottom: 'inset 0 -1px 2px rgba(255, 255, 255, 0.04)',
    }
});

export default DarkTheme;