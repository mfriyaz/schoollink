import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import { buildTheme } from "./theme";
import { DEFAULT_THEME, THEMES, THEME_LIST, applyThemeVars, getTheme } from "./themes";
import { getSchoolTheme, saveSchoolTheme } from "../services/themeService";

const STORAGE_KEY = "sl_theme";

const AppThemeContext = createContext(null);

function readCached() {

    try {

        const id = localStorage.getItem(STORAGE_KEY);

        return THEMES[id] ? id : DEFAULT_THEME;

    } catch {

        return DEFAULT_THEME;

    }

}

function currentRole() {

    try {

        return JSON.parse(localStorage.getItem("user"))?.role || null;

    } catch {

        return null;

    }

}

/**
 * Colour theme for the whole app.
 *  - the School Admin picks one in Settings and it is saved on the school,
 *    so teachers and parents of that school see the same colours;
 *  - the last theme is cached on the device so the login page and the first
 *    paint use it straight away.
 */
function ThemeProvider({ children }) {

    const [savedId, setSavedId] = useState(readCached);

    const [previewId, setPreviewId] = useState(null);

    // The Super Admin console keeps its own violet look
    const role = currentRole();

    const effectiveId = previewId || (role === "Super Admin" ? "royal" : savedId);

    const t = getTheme(effectiveId);

    const muiTheme = useMemo(() => buildTheme(t), [t]);

    // Apply before paint so there is no colour flash
    useMemo(() => { applyThemeVars(t); }, [t]);

    useEffect(() => { applyThemeVars(t); }, [t]);

    // Ask the server which theme the school chose (needs a login)
    const refresh = useCallback(async () => {

        if (!localStorage.getItem("token") || currentRole() === "Super Admin") return;

        try {

            const res = await getSchoolTheme();

            const id = res?.data?.theme;

            if (THEMES[id]) {

                setSavedId(id);

                try { localStorage.setItem(STORAGE_KEY, id); } catch { /* private mode */ }

            }

        } catch {

            // keep the cached theme

        }

    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    // School Admin: save the chosen theme for the whole school
    const save = useCallback(async (id) => {

        const res = await saveSchoolTheme(id);

        if (res?.success) {

            setSavedId(id);

            setPreviewId(null);

            try { localStorage.setItem(STORAGE_KEY, id); } catch { /* private mode */ }

        }

        return res;

    }, []);

    const value = useMemo(() => ({

        themeId: effectiveId,
        savedId,
        themes: THEME_LIST,
        preview: setPreviewId,
        cancelPreview: () => setPreviewId(null),
        save,
        refresh

    }), [effectiveId, savedId, save, refresh]);

    return (

        <AppThemeContext.Provider value={value}>

            <MuiThemeProvider theme={muiTheme}>

                {/* Reset browser styles */}
                <CssBaseline />

                {children}

            </MuiThemeProvider>

        </AppThemeContext.Provider>

    );

}

export function useAppTheme() {

    return useContext(AppThemeContext);

}

export default ThemeProvider;
