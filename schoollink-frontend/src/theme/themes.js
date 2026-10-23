/**
 * SchoolLink colour themes - all solid colours (no gradients).
 *
 * Each school picks one in Settings (School Admin). To add a theme, add an
 * entry here AND its id to THEMES in backend/src/controllers/schoolTheme.controller.js.
 *
 *  primary      main brand colour: icons, links, solid banners and chips
 *  soft/soft2   pale tints of it (icon tiles, highlights, input borders)
 *  accent       the second colour
 *  btn*         the main call-to-action button
 *  side*        the left menu;  nav*  the active tab of the phone bottom bar
 *  loginPanel   the panel behind the school illustration on the login page
 */
export const THEMES = {

    // 1) Yellow & Black
    sunshine: {
        id: "sunshine",
        name: "Sunshine",
        tagline: "Yellow & Black",
        primary: "#111827", primaryDark: "#000000", primaryLight: "#4B5563",
        soft: "#FFF0B0", soft2: "#F0E1A0", ink: "#111827",
        accent: "#FFC400", accentDark: "#F5B300",
        pageBg: "#FFFCEB", border: "#F2E8B8", page2: "#FFFCEB",
        btnBg: "#FFC400", btnHover: "#FFB300", btnText: "#111827", btnBorder: "1.5px solid #111827",
        btnShadowCss: "0 3px 0 #111827", btnShadowHoverCss: "0 4px 0 #111827", btnShadow: "rgba(17,24,39,0.30)",
        cardShadow: "0 1px 0 rgba(17,24,39,0.08), 0 2px 8px rgba(17,24,39,0.06)", cardShadowHover: "0 2px 0 rgba(17,24,39,0.12), 0 8px 18px rgba(17,24,39,0.12)",
        tabIndicator: "#FFC400", metaColor: "#111827",
        sideBg: "#0B0B0C", sideActive: "#FFC400", onActive: "#111827", sideText: "#F4F4F5", sideMuted: "rgba(244,244,245,0.68)", glow: "rgba(0,0,0,0)",
        navActive: "#FFC400", onNavActive: "#111827",
        banner: "#FFC400", onBanner: "#111827", bannerBorder: "1.5px solid #111827", bannerShadow: "0 3px 0 #111827",
        loginBg: "#FFFCEB", loginPanel: "#FFC400"
    },

    // 2) Sky Blue & Black
    sky: {
        id: "sky",
        name: "Sky",
        tagline: "Sky Blue & Black",
        primary: "#0F172A", primaryDark: "#000000", primaryLight: "#475569",
        soft: "#D4EEFC", soft2: "#9FD6F2", ink: "#0F172A",
        accent: "#38BDF8", accentDark: "#0EA5E9",
        pageBg: "#EEF8FF", border: "#CFE4F2", page2: "#EEF8FF",
        btnBg: "#38BDF8", btnHover: "#0EA5E9", btnText: "#0F172A", btnBorder: "1.5px solid #0F172A",
        btnShadowCss: "0 3px 0 #0F172A", btnShadowHoverCss: "0 4px 0 #0F172A", btnShadow: "rgba(15,23,42,0.30)",
        cardShadow: "0 1px 0 rgba(15,23,42,0.08), 0 2px 8px rgba(15,23,42,0.06)", cardShadowHover: "0 2px 0 rgba(15,23,42,0.12), 0 8px 18px rgba(15,23,42,0.12)",
        tabIndicator: "#38BDF8", metaColor: "#0B0F14",
        sideBg: "#0B0F14", sideActive: "#38BDF8", onActive: "#0F172A", sideText: "#E2E8F0", sideMuted: "rgba(226,232,240,0.55)", glow: "rgba(0,0,0,0)",
        navActive: "#38BDF8", onNavActive: "#0F172A",
        banner: "#38BDF8", onBanner: "#0F172A", bannerBorder: "1.5px solid #0F172A", bannerShadow: "0 3px 0 #0F172A",
        loginBg: "#EEF8FF", loginPanel: "#38BDF8"
    },

    // 3) Dark Maroon & White
    maroon: {
        id: "maroon",
        name: "Maroon",
        tagline: "Dark Maroon & White",
        primary: "#6D0F2B", primaryDark: "#4A0A1D", primaryLight: "#A3304F",
        soft: "#FCE8ED", soft2: "#EFC3CE", ink: "#2B0A14",
        accent: "#FFFFFF", accentDark: "#F3D9DF",
        pageBg: "#FFF8FA", border: "#F2DCE2", page2: "#FFF8FA",
        btnBg: "#6D0F2B", btnHover: "#4A0A1D", btnText: "#FFFFFF", btnBorder: "none",
        btnShadowCss: "0 3px 0 #3A0817", btnShadowHoverCss: "0 4px 0 #3A0817", btnShadow: "rgba(109,15,43,0.30)",
        cardShadow: "0 1px 0 rgba(109,15,43,0.08), 0 2px 8px rgba(109,15,43,0.06)", cardShadowHover: "0 2px 0 rgba(109,15,43,0.12), 0 8px 18px rgba(109,15,43,0.14)",
        tabIndicator: "#6D0F2B", metaColor: "#650F28",
        sideBg: "#650F28", sideActive: "#FFFFFF", onActive: "#6D0F2B", sideText: "#FFF1F4", sideMuted: "rgba(255,241,244,0.72)", glow: "rgba(0,0,0,0)",
        navActive: "#6D0F2B", onNavActive: "#FFFFFF",
        banner: "#6D0F2B", onBanner: "#FFFFFF", bannerBorder: "none", bannerShadow: "0 6px 16px rgba(109,15,43,0.22)",
        loginBg: "#FFF8FA", loginPanel: "#FCE8ED"
    },

    // 4) Coral
    coral: {
        id: "coral",
        name: "Coral",
        tagline: "Soft Coral & Dark",
        primary: "#2B1215", primaryDark: "#1F0D10", primaryLight: "#2B1215",
        soft: "#FFE3E3", soft2: "#FFC4C4", ink: "#2B1215",
        accent: "#FF8A8A", accentDark: "#FF6F6F",
        pageBg: "#FFF6F5", border: "#F7D5D3", page2: "#FFF6F5",
        btnBg: "#FF8A8A", btnHover: "#FF7878", btnText: "#2B1215", btnBorder: "1.5px solid #2B1215",
        btnShadowCss: "0 3px 0 #2B1215", btnShadowHoverCss: "0 4px 0 #2B1215", btnShadow: "rgba(0,0,0,0.28)",
        cardShadow: "0 1px 0 rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)", cardShadowHover: "0 2px 0 rgba(0,0,0,0.12), 0 8px 18px rgba(0,0,0,0.12)",
        tabIndicator: "#FF8A8A", metaColor: "#1F0D10",
        sideBg: "#1F0D10", sideActive: "#FF8A8A", onActive: "#2B1215", sideText: "#FFF1F0", sideMuted: "rgba(255,241,240,0.68)", glow: "rgba(0,0,0,0)",
        navActive: "#FF8A8A", onNavActive: "#2B1215",
        banner: "#FF8A8A", onBanner: "#2B1215", bannerBorder: "1.5px solid #2B1215", bannerShadow: "0 3px 0 #2B1215",
        loginBg: "#FFF6F5", loginPanel: "#FF8A8A"
    },

    // 5) Mint
    mint: {
        id: "mint",
        name: "Mint",
        tagline: "Fresh Mint & Dark",
        primary: "#062B26", primaryDark: "#06231F", primaryLight: "#062B26",
        soft: "#D8FBF4", soft2: "#A8F0E2", ink: "#062B26",
        accent: "#77F1DB", accentDark: "#4FE0C6",
        pageBg: "#F0FDFA", border: "#C6EFE7", page2: "#F0FDFA",
        btnBg: "#77F1DB", btnHover: "#5FE8CE", btnText: "#062B26", btnBorder: "1.5px solid #062B26",
        btnShadowCss: "0 3px 0 #062B26", btnShadowHoverCss: "0 4px 0 #062B26", btnShadow: "rgba(0,0,0,0.28)",
        cardShadow: "0 1px 0 rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)", cardShadowHover: "0 2px 0 rgba(0,0,0,0.12), 0 8px 18px rgba(0,0,0,0.12)",
        tabIndicator: "#77F1DB", metaColor: "#06231F",
        sideBg: "#06231F", sideActive: "#77F1DB", onActive: "#062B26", sideText: "#ECFFFB", sideMuted: "rgba(236,255,251,0.68)", glow: "rgba(0,0,0,0)",
        navActive: "#77F1DB", onNavActive: "#062B26",
        banner: "#77F1DB", onBanner: "#062B26", bannerBorder: "1.5px solid #062B26", bannerShadow: "0 3px 0 #062B26",
        loginBg: "#F0FDFA", loginPanel: "#77F1DB"
    },

    // 6) Butter
    butter: {
        id: "butter",
        name: "Butter",
        tagline: "Soft Butter & Dark",
        primary: "#2B2508", primaryDark: "#1C1805", primaryLight: "#2B2508",
        soft: "#FBF3C6", soft2: "#F1E49C", ink: "#2B2508",
        accent: "#F1DE77", accentDark: "#E8D04F",
        pageBg: "#FFFDF0", border: "#EEE3B0", page2: "#FFFDF0",
        btnBg: "#F1DE77", btnHover: "#EAD45E", btnText: "#2B2508", btnBorder: "1.5px solid #2B2508",
        btnShadowCss: "0 3px 0 #2B2508", btnShadowHoverCss: "0 4px 0 #2B2508", btnShadow: "rgba(0,0,0,0.28)",
        cardShadow: "0 1px 0 rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)", cardShadowHover: "0 2px 0 rgba(0,0,0,0.12), 0 8px 18px rgba(0,0,0,0.12)",
        tabIndicator: "#F1DE77", metaColor: "#1C1805",
        sideBg: "#1C1805", sideActive: "#F1DE77", onActive: "#2B2508", sideText: "#FFFBE6", sideMuted: "rgba(255,251,230,0.68)", glow: "rgba(0,0,0,0)",
        navActive: "#F1DE77", onNavActive: "#2B2508",
        banner: "#F1DE77", onBanner: "#2B2508", bannerBorder: "1.5px solid #2B2508", bannerShadow: "0 3px 0 #2B2508",
        loginBg: "#FFFDF0", loginPanel: "#F1DE77"
    },

    // Used only by the Super Admin console (not offered to schools)
    platform: {
        id: "platform",
        hidden: true,
        name: "Platform",
        tagline: "Super Admin",
        primary: "#1E3A8A", primaryDark: "#172554", primaryLight: "#3B5BDB",
        soft: "#E0E7FF", soft2: "#A5B4FC", ink: "#0F1B3D",
        accent: "#3B5BDB", accentDark: "#2F49B5",
        pageBg: "#F8FAFC", border: "#E2E8F0", page2: "#F8FAFC",
        btnBg: "#3B5BDB", btnHover: "#2F49B5", btnText: "#FFFFFF", btnBorder: "none",
        btnShadowCss: "0 3px 0 #1E3A8A", btnShadowHoverCss: "0 4px 0 #1E3A8A", btnShadow: "rgba(30,58,138,0.30)",
        cardShadow: "0 1px 0 rgba(15,27,61,0.06), 0 2px 8px rgba(15,27,61,0.05)", cardShadowHover: "0 2px 0 rgba(15,27,61,0.10), 0 8px 18px rgba(15,27,61,0.10)",
        tabIndicator: "#3B5BDB", metaColor: "#0F1B3D",
        sideBg: "#0F1B3D", sideActive: "#3B5BDB", onActive: "#FFFFFF", sideText: "#CBD5F5", sideMuted: "rgba(203,213,245,0.55)", glow: "rgba(0,0,0,0)",
        navActive: "#3B5BDB", onNavActive: "#FFFFFF",
        banner: "#3B5BDB", onBanner: "#FFFFFF", bannerBorder: "none", bannerShadow: "0 6px 16px rgba(30,58,138,0.22)",
        loginBg: "#F8FAFC", loginPanel: "#E0E7FF"
    }

};

export const DEFAULT_THEME = "sunshine";

/** The themes a School Admin can choose from */
export const THEME_LIST = Object.values(THEMES).filter((t) => !t.hidden);

export function getTheme(id) {

    return THEMES[id] || THEMES[DEFAULT_THEME];

}

/** Publishes the theme as CSS variables so any component can use var(--sl-...) */
export function applyThemeVars(t) {

    const root = document.documentElement.style;

    const vars = {
        primary: t.primary, "primary-dark": t.primaryDark, "primary-light": t.primaryLight,
        soft: t.soft, soft2: t.soft2, ink: t.ink, accent: t.accent, "accent-dark": t.accentDark,
        page: t.pageBg, page2: t.page2, border: t.border,
        "btn-bg": t.btnBg, "btn-text": t.btnText, "btn-border": t.btnBorder || "none",
        "side-bg": t.sideBg, "side-active": t.sideActive, "on-active": t.onActive,
        "side-text": t.sideText, "side-muted": t.sideMuted, glow: t.glow,
        "nav-active": t.navActive, "on-nav-active": t.onNavActive,
        banner: t.banner, "on-banner": t.onBanner, "banner-border": t.bannerBorder, "banner-shadow": t.bannerShadow,
        "login-bg": t.loginBg, "login-panel": t.loginPanel
    };

    Object.entries(vars).forEach(([k, v]) => root.setProperty(`--sl-${k}`, v));

    const meta = document.querySelector('meta[name="theme-color"]');

    if (meta) meta.setAttribute("content", t.metaColor || t.primary);

    applyFavicon(t);

    applyTouchIcon(t);

}

/** Browser tab icon: the SchoolLink book in the school's theme colours */
export function applyFavicon(t) {

    try {

        const outline = String(t.onBanner).toUpperCase() === "#FFFFFF" ? "none" : t.onBanner;

        const page = (d) => '<path d="' + d + '" fill="#FFFFFF" stroke="' + outline + '" stroke-width="18" stroke-linejoin="round"/>';

        const svg =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">' +
            '<rect width="512" height="512" rx="112" fill="' + t.banner + '"/>' +
            page("M248 130C212 102 150 98 92 116L92 372C150 354 212 358 248 386Z") +
            page("M264 130C300 102 362 98 420 116L420 372C362 354 300 358 264 386Z") + '</svg>';

        let link = document.querySelector('link[rel="icon"]');

        if (!link) {

            link = document.createElement("link");

            link.rel = "icon";

            document.head.appendChild(link);

        }

        link.type = "image/svg+xml";

        link.href = "data:image/svg+xml," + encodeURIComponent(svg);

    } catch (e) {

        // the tab icon is cosmetic - never break the app over it

    }

}


/**
 * Phone home-screen icon (iPhone "Add to Home Screen"): the same book in the school's theme colour.
 * iPhone ignores the SVG tab icon and needs a square PNG, so it is drawn here from the same picture.
 * It is full-bleed (no rounded corners) because the phone rounds the corners itself.
 */
export function applyTouchIcon(t) {

    try {

        const outline = String(t.onBanner).toUpperCase() === "#FFFFFF" ? "none" : t.onBanner;

        const page = (d) => '<path d="' + d + '" fill="#FFFFFF" stroke="' + outline + '" stroke-width="18" stroke-linejoin="round"/>';

        const svg =
            '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">' +
            '<rect width="512" height="512" fill="' + t.banner + '"/>' +
            page("M248 130C212 102 150 98 92 116L92 372C150 354 212 358 248 386Z") +
            page("M264 130C300 102 362 98 420 116L420 372C362 354 300 358 264 386Z") + '</svg>';

        const img = new Image();

        img.onload = () => {

            try {

                const canvas = document.createElement("canvas");

                canvas.width = 180;

                canvas.height = 180;

                canvas.getContext("2d").drawImage(img, 0, 0, 180, 180);

                let link = document.querySelector('link[rel="apple-touch-icon"]');

                if (!link) {

                    link = document.createElement("link");

                    link.rel = "apple-touch-icon";

                    document.head.appendChild(link);

                }

                link.setAttribute("sizes", "180x180");

                link.href = canvas.toDataURL("image/png");

            } catch (e) {

                // cosmetic only - keep the default icon

            }

        };

        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);

    } catch (e) {

        // cosmetic only

    }

}
