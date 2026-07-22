import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import theme from "./theme";

function ThemeProvider({ children }) {

    return (

        <MuiThemeProvider theme={theme}>

            {/* Reset browser styles */}
            <CssBaseline />

            {children}

        </MuiThemeProvider>

    );

}

export default ThemeProvider;