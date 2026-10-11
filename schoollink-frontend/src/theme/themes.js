/**
 * SchoolLink colour themes.
 *
 * Each school picks one in Settings (School Admin). To add a theme, add an
 * entry here AND its id to THEMES in backend/src/controllers/schoolTheme.controller.js.
 *
 *  primary      main brand colour: icons, links, headings accents, solid chips
 *  soft/soft2   pale tints of it (icon tiles, highlights)
 *  accent       the "catchy" second colour (buttons, active menu item)
 *  btn*         the main call-to-action button
 *  side*        the left menu and the phone bottom bar
 */
export const THEMES = {

    sunshine: {
        id: "sunshine",
        name: "Sunshine",
        tagline: "Black & Yellow",
        primary: "#111827", primaryDark: "#000000", primaryLight: "#4B5563",
        soft: "#FFF4C7", soft2: "#FFE28A", ink: "#111827",
        accent: "#FFC107", accentDark: "#F5A800",
        pageBg: "#FFFBEB", border: "#F1E7BD", page2: "#FFF3C4",
        btnBg: "linear-gradient(135deg,#FFD84D 0%,#FFB800 100%)", btnHover: "linear-gradient(135deg,#FFC107 0%,#F59E0B 100%)", btnText: "#111827", btnShadow: "rgba(255,184,0,0.38)",
        sideBg: "linear-gradient(180deg,#0A0A0B 0%,#151516 60%,#202022 100%)", sideActive: "linear-gradient(135deg,#FFD84D 0%,#FFB800 100%)", onActive: "#111827", sideText: "#D4D4D8", sideMuted: "rgba(212,212,216,0.55)", glow: "rgba(255,193,7,0.45)",
        loginBg: "radial-gradient(circle at 15% 10%, #FFF1B8 0%, transparent 45%), radial-gradient(circle at 90% 85%, #E5E7EB 0%, transparent 40%), #FFFBEB",
        loginPanel: "linear-gradient(160deg,#FFF4C7 0%,#FFE28A 60%,#FFD84D 100%)"
    },

    royal: {
        id: "royal",
        name: "Royal",
        tagline: "Indigo & Coral",
        primary: "#4F46E5", primaryDark: "#4338CA", primaryLight: "#818CF8",
        soft: "#E0E7FF", soft2: "#C7D2FE", ink: "#1E1B4B",
        accent: "#FF6B6B", accentDark: "#F04F5F",
        pageBg: "#F4F5FF", border: "#E8E9F8", page2: "#EEF0FF",
        btnBg: "linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%)", btnHover: "linear-gradient(135deg,#4338CA 0%,#6D28D9 100%)", btnText: "#FFFFFF", btnShadow: "rgba(79,70,229,0.32)",
        sideBg: "linear-gradient(180deg,#1E1B4B 0%,#312E81 60%,#3730A3 100%)", sideActive: "linear-gradient(135deg,#6366F1 0%,#8B5CF6 100%)", onActive: "#FFFFFF", sideText: "#C7D2FE", sideMuted: "rgba(199,210,254,0.55)", glow: "rgba(99,102,241,0.55)",
        loginBg: "radial-gradient(circle at 15% 10%, #E0E7FF 0%, transparent 45%), radial-gradient(circle at 90% 85%, #FFE4E6 0%, transparent 40%), #F4F5FF",
        loginPanel: "linear-gradient(160deg,#E0E7FF 0%,#EDE9FE 55%,#FFE4E6 100%)"
    },

    emerald: {
        id: "emerald",
        name: "Emerald",
        tagline: "Green & Gold",
        primary: "#059669", primaryDark: "#047857", primaryLight: "#34D399",
        soft: "#D1FAE5", soft2: "#A7F3D0", ink: "#064E3B",
        accent: "#F59E0B", accentDark: "#D97706",
        pageBg: "#F0FDF8", border: "#D5F0E6", page2: "#E3F8EF",
        btnBg: "linear-gradient(135deg,#10B981 0%,#059669 100%)", btnHover: "linear-gradient(135deg,#059669 0%,#047857 100%)", btnText: "#FFFFFF", btnShadow: "rgba(5,150,105,0.32)",
        sideBg: "linear-gradient(180deg,#022C22 0%,#064E3B 60%,#065F46 100%)", sideActive: "linear-gradient(135deg,#10B981 0%,#14B8A6 100%)", onActive: "#FFFFFF", sideText: "#A7F3D0", sideMuted: "rgba(167,243,208,0.55)", glow: "rgba(16,185,129,0.5)",
        loginBg: "radial-gradient(circle at 15% 10%, #D1FAE5 0%, transparent 45%), radial-gradient(circle at 90% 85%, #FEF3C7 0%, transparent 40%), #F0FDF8",
        loginPanel: "linear-gradient(160deg,#D1FAE5 0%,#A7F3D0 55%,#FEF3C7 100%)"
    },

    sunset: {
        id: "sunset",
        name: "Sunset",
        tagline: "Orange & Rose",
        primary: "#EA580C", primaryDark: "#C2410C", primaryLight: "#FB923C",
        soft: "#FFEDD5", soft2: "#FED7AA", ink: "#431407",
        accent: "#F43F5E", accentDark: "#E11D48",
        pageBg: "#FFF8F1", border: "#FBE3CF", page2: "#FFEFE0",
        btnBg: "linear-gradient(135deg,#F97316 0%,#EA580C 100%)", btnHover: "linear-gradient(135deg,#EA580C 0%,#C2410C 100%)", btnText: "#FFFFFF", btnShadow: "rgba(234,88,12,0.34)",
        sideBg: "linear-gradient(180deg,#431407 0%,#7C2D12 60%,#9A3412 100%)", sideActive: "linear-gradient(135deg,#FB923C 0%,#F43F5E 100%)", onActive: "#FFFFFF", sideText: "#FED7AA", sideMuted: "rgba(254,215,170,0.55)", glow: "rgba(244,63,94,0.45)",
        loginBg: "radial-gradient(circle at 15% 10%, #FFEDD5 0%, transparent 45%), radial-gradient(circle at 90% 85%, #FFE4E6 0%, transparent 40%), #FFF8F1",
        loginPanel: "linear-gradient(160deg,#FFEDD5 0%,#FED7AA 55%,#FECDD3 100%)"
    }

};

export const DEFAULT_THEME = "sunshine";

export const THEME_LIST = Object.values(THEMES);

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
        "btn-bg": t.btnBg, "btn-text": t.btnText, "btn-shadow": t.btnShadow,
        "side-bg": t.sideBg, "side-active": t.sideActive, "on-active": t.onActive,
        "side-text": t.sideText, "side-muted": t.sideMuted, glow: t.glow,
        "login-bg": t.loginBg, "login-panel": t.loginPanel
    };

    Object.entries(vars).forEach(([k, v]) => root.setProperty(`--sl-${k}`, v));

    const meta = document.querySelector('meta[name="theme-color"]');

    if (meta) meta.setAttribute("content", t.accent === "#FFC107" ? "#111827" : t.primary);

}
