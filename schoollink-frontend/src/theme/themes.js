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

    // Used only by the Super Admin console (not offered to schools)
    platform: {
        id: "platform",
        hidden: true,
        name: "Platform",
        tagline: "Super Admin",
        primary: "#5B21B6", primaryDark: "#4C1D95", primaryLight: "#8B5CF6",
        soft: "#EDE9FE", soft2: "#C4B5FD", ink: "#2E1065",
        accent: "#7C3AED", accentDark: "#6D28D9",
        pageBg: "#F6F3FF", border: "#E3DCF7", page2: "#F6F3FF",
        btnBg: "#7C3AED", btnHover: "#6D28D9", btnText: "#FFFFFF", btnBorder: "none",
        btnShadowCss: "0 3px 0 #4C1D95", btnShadowHoverCss: "0 4px 0 #4C1D95", btnShadow: "rgba(91,33,182,0.30)",
        cardShadow: "0 1px 0 rgba(46,16,101,0.08), 0 2px 8px rgba(46,16,101,0.06)", cardShadowHover: "0 2px 0 rgba(46,16,101,0.12), 0 8px 18px rgba(46,16,101,0.12)",
        tabIndicator: "#7C3AED", metaColor: "#2E1065",
        sideBg: "#2E1065", sideActive: "#7C3AED", onActive: "#FFFFFF", sideText: "#DDD6FE", sideMuted: "rgba(221,214,254,0.55)", glow: "rgba(0,0,0,0)",
        navActive: "#7C3AED", onNavActive: "#FFFFFF",
        banner: "#7C3AED", onBanner: "#FFFFFF", bannerBorder: "none", bannerShadow: "0 6px 16px rgba(91,33,182,0.22)",
        loginBg: "#F6F3FF", loginPanel: "#EDE9FE"
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

}
