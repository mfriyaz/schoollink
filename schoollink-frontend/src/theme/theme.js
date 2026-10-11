import { createTheme } from "@mui/material/styles";

/**
 * SchoolLink design system - one place that styles every page.
 *
 * Change a value here and the whole app follows (cards, buttons,
 * inputs, tables, tabs, dialogs, chips...). Pages should only add
 * their own sx when they need something genuinely different.
 */

const HEAD_FONT = "Poppins, Nunito, Inter, Segoe UI, Roboto, Arial, sans-serif";


export function buildTheme(t) {

const BORDER = t.border;
const CARD_SHADOW = t.cardShadow || `0 2px 8px ${t.btnShadow.replace(/[\d.]+\)$/, "0.08)")}`;
const CARD_SHADOW_HOVER = t.cardShadowHover || `0 10px 24px ${t.btnShadow.replace(/[\d.]+\)$/, "0.16)")}`;

// MUI needs 25 shadow levels. Level 1 is what a plain <Paper> / <Card>
// uses, so making it soft and thin restyles every card at once.
const baseTheme = createTheme();
const shadows = [...baseTheme.shadows];
shadows[1] = CARD_SHADOW;
shadows[2] = CARD_SHADOW;
shadows[3] = CARD_SHADOW_HOVER;

return createTheme({

    palette: {
        mode: "light",
        // Indigo (main) + coral (accent) + teal (success)
        primary: { main: t.primary, dark: t.primaryDark, light: t.primaryLight, contrastText: "#FFFFFF" },
        secondary: { main: t.accent, dark: t.accentDark, light: t.accent, contrastText: t.btnText },
        success: { main: "#14B8A6", dark: "#0D9488" },
        warning: { main: "#F59E0B" },
        error: { main: "#EF4444" },
        info: { main: "#0EA5E9" },
        background: { default: t.pageBg, paper: "#FFFFFF" },
        text: { primary: t.ink, secondary: "#64748B" },
        divider: BORDER
    },

    shape: { borderRadius: 12 },

    shadows,

    typography: {
        fontFamily: [
            "Nunito",
            "Inter",
            "Segoe UI",
            "Roboto",
            "Helvetica",
            "Arial",
            "sans-serif"
        ].join(","),

        h4: { fontFamily: HEAD_FONT, fontWeight: 700, fontSize: "1.6rem", letterSpacing: "-0.01em" },
        h5: { fontFamily: HEAD_FONT, fontWeight: 700, fontSize: "1.4rem", letterSpacing: "-0.01em" },
        h6: { fontFamily: HEAD_FONT, fontWeight: 700, fontSize: "1.05rem" },
        subtitle1: { fontWeight: 600 },
        body2: { fontSize: "0.875rem" },
        button: { textTransform: "none", fontWeight: 600 }
    },

    components: {

        MuiCssBaseline: {
            styleOverrides: {
                html: { overflowX: "hidden" },
                body: {
                    WebkitFontSmoothing: "antialiased",
                    MozOsxFontSmoothing: "grayscale",
                    overflowX: "hidden",
                    WebkitTextSizeAdjust: "100%"
                },
                // 16px inputs on phones stop iOS from zooming the page on focus
                "@media (max-width:600px)": {
                    "input, select, textarea": { fontSize: "16px !important" }
                },
                img: { maxWidth: "100%" }
            }
        },

        // ---------- Surfaces ----------
        MuiPaper: {
            styleOverrides: {
                root: { backgroundImage: "none" },
                rounded: { borderRadius: 12 }
            }
        },

        MuiCard: {
            defaultProps: { elevation: 1 },
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    border: `1px solid ${BORDER}`
                }
            }
        },

        MuiCardActionArea: {
            styleOverrides: {
                root: { borderRadius: 12 }
            }
        },

        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 16,
                    "@media (max-width:600px)": {
                        margin: 12,
                        width: "calc(100% - 24px)",
                        maxWidth: "calc(100% - 24px)",
                        maxHeight: "calc(100% - 24px)"
                    }
                }
            }
        },

        MuiTableContainer: {
            styleOverrides: {
                root: { overflowX: "auto", WebkitOverflowScrolling: "touch" }
            }
        },

        MuiDialogTitle: {
            styleOverrides: {
                root: { fontWeight: 700, fontSize: "1.1rem" }
            }
        },

        MuiMenu: {
            styleOverrides: {
                paper: {
                    borderRadius: 12,
                    border: `1px solid ${BORDER}`,
                    boxShadow: "0 10px 30px rgba(15,23,42,0.12)"
                }
            }
        },

        MuiPopover: {
            styleOverrides: {
                paper: { borderRadius: 12 }
            }
        },

        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    borderRadius: 8,
                    fontSize: "0.75rem",
                    backgroundColor: t.ink
                }
            }
        },

        // ---------- Buttons ----------
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    fontWeight: 700,
                    paddingLeft: 18,
                    paddingRight: 18,
                    paddingTop: 8,
                    paddingBottom: 8
                },
                sizeSmall: {
                    paddingLeft: 12,
                    paddingRight: 12,
                    paddingTop: 5,
                    paddingBottom: 5,
                    fontSize: "0.82rem"
                },
                outlined: {
                    borderColor: t.soft2
                }
            },

            // MUI 9: colour-specific styles go in "variants"
            variants: [
                {
                    props: { variant: "contained", color: "primary" },
                    style: {
                        background: t.btnBg,
                        color: t.btnText,
                        border: t.btnBorder || "none",
                        boxShadow: t.btnShadowCss || `0 6px 14px ${t.btnShadow}`,
                        "&:hover": {
                            background: t.btnHover,
                            boxShadow: t.btnShadowHoverCss || `0 8px 18px ${t.btnShadow}`
                        },
                        "&:active": t.btnBorder ? { transform: "translateY(2px)", boxShadow: "0 1px 0 #111827" } : {},
                        "&.Mui-disabled": { background: "#E2E8F0", color: "#94A3B8", boxShadow: "none", border: "none" }
                    }
                },
                {
                    props: { variant: "contained", color: "secondary" },
                    style: {
                        background: t.accent,
                        color: t.btnText,
                        boxShadow: `0 6px 14px ${t.btnShadow}`,
                        "&:hover": { background: t.accentDark }
                    }
                }
            ]
        },

        MuiIconButton: {
            styleOverrides: {
                root: { borderRadius: 10 }
            }
        },

        // ---------- Inputs ----------
        MuiTextField: {
            defaultProps: { variant: "outlined", size: "small" }
        },

        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    backgroundColor: "#FFFFFF",
                    "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: t.soft2
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: t.primaryLight
                    }
                }
            }
        },

        // ---------- Feedback ----------
        MuiAlert: {
            styleOverrides: {
                root: { borderRadius: 10, alignItems: "center" }
            }
        },

        MuiChip: {
            styleOverrides: {
                root: { fontWeight: 600, borderRadius: 8 },
                sizeSmall: { height: 24, fontSize: "0.75rem" }
            }
        },

        MuiBadge: {
            styleOverrides: {
                badge: { fontWeight: 700 }
            }
        },

        MuiLinearProgress: {
            styleOverrides: {
                root: { borderRadius: 4 }
            }
        },

        // ---------- Navigation ----------
        MuiTabs: {
            styleOverrides: {
                root: { minHeight: 42 },
                indicator: { height: 3, borderRadius: "3px 3px 0 0", background: t.tabIndicator || t.accent }
            }
        },

        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    fontWeight: 600,
                    minHeight: 42
                }
            }
        },

        MuiMenuItem: {
            styleOverrides: {
                root: { borderRadius: 8, margin: "2px 6px" }
            }
        },

        // ---------- Tables ----------
        MuiTableContainer: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    border: `1px solid ${BORDER}`
                }
            }
        },

        MuiTableHead: {
            styleOverrides: {
                root: { backgroundColor: t.page2 }
            }
        },

        MuiTableCell: {
            styleOverrides: {
                root: { borderBottom: `1px solid ${BORDER}` },
                head: {
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    color: t.primaryDark,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em"
                }
            }
        },

        MuiTableRow: {
            styleOverrides: {
                root: {
                    "&:hover": { backgroundColor: t.pageBg },
                    "&:last-child td": { borderBottom: 0 }
                }
            }
        }
    }
});

}
