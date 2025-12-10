import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const LightTheme = (outerTheme) => createTheme({
    ...outerTheme,
    spacing: 8,
    palette: {
        mode: 'light',
        primary: {
            main: "#0A6BB9",
            light: "#57B4FF"
        },
        background: {
            default: "#FFFFFF",
            paper: "#EEEEEF"
        }
    },
    components: {
        MuiTypography: {
            styleOverrides: {
                root: {
                    color: "#12181D",
                }
            }
        },
    },
    custom: {
        paperTitle: '#FFFFFF',
    }
});

export default LightTheme;