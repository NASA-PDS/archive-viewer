import { ThemeProvider } from "@mui/material/styles";
import { getTheme } from "services/pages";
import GlobalTheme from "GlobalTheme";

export default function Themed(props) {
    const theme = getTheme(props);
    return <ThemeProvider theme={GlobalTheme}>
        <ThemeProvider theme={outerTheme => theme(outerTheme)}>
            {props.children}
        </ThemeProvider>
    </ThemeProvider>
}