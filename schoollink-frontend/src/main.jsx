import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import App from "./App";
import ThemeProvider from "./theme/ThemeProvider";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(

    <React.StrictMode>

        <BrowserRouter>

            <ThemeProvider>

                <LocalizationProvider dateAdapter={AdapterDateFns}>

                    <App />

                </LocalizationProvider>

            </ThemeProvider>

        </BrowserRouter>

    </React.StrictMode>

);