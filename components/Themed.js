import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { getTheme } from "services/pages";

export default function Themed(props) {
    return <StyledEngineProvider injectFirst>
            <ThemeProvider theme={getTheme(props)}>
                {props.children}
            </ThemeProvider>
        </StyledEngineProvider>
    
}