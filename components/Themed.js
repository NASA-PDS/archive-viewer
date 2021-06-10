import { ThemeProvider } from "@material-ui/styles";
import { getTheme } from "services/pages";

export default function Themed(props) {
    return <ThemeProvider theme={getTheme(props)}>
        {props.children}
    </ThemeProvider>
}