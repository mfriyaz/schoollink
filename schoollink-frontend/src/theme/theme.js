import { createTheme } from "@mui/material/styles";

/**
 * SchoolLink design system - one place that styles every page.
 *
 * Change a value here and the whole app follows (cards, buttons,
 * inputs, tables, tabs, dialogs, chips...). Pages should only add
 * their own sx when they need something genuinely different.
 */

const BORDER = "#EEF2F7";
const CARD_SHADOW = "0 1px 3px rgba(15,23,42,0.06)";
const CARD_SHADOW_HOVER = "0 6px 16px rgba(15,23,42,0.08)";

// MUI needs 25 shadow levels. Level 1 is what a plain <Paper> / <Card>
// uses, so making it soft and thin restyles every card at once.
const baseTheme = createTheme();
const shadows = [...baseTheme.shadows];
shadows[1] = CARD_SHADOW;
shadows[2] = CARD_SHADOW;
shadows[3] = CARD_SHADOW_HOVER;

const theme = createTheme({

    palette: {
        mode: "light",
        primary: { main: "#2563EB", dark: "#1D4ED8", light: "#60A5FA" },
        secondary: { main: "#7C3AED" },
        success: { main: "#16A34A" },
        warning: { main: "#F59E0B" },
        error: { main: "#EF4444" },
        info: { main: "#0EA5E9" },
        background: { default: "#F5F7FB", paper: "#FFFFFF" },
        text: { primary: "#0F172A", secondary: "#64748B" },
        divider: BORDER
    },

    shape: { borderRadius: 12 },

    shadows,

    typography: {
        fontFamily: [
            "Inter",
            "Segoe UI",
            "Roboto",
            "Helvetica",
            "Arial",
            "sans-serif"
        ].join(","),

        h4: { fontWeight: 700, fontSize: "1.6rem", letterSpacing: "-0.01em" },
        h5: { fontWeight: 700, fontSize: "1.4rem", letterSpacing: "-0.01em" },
        h6: { fontWeight: 700, fontSize: "1.05rem" },
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
                    backgroundColor: "#0F172A"
                }
            }
        },

        // ---------- Buttons ----------
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    fontWeight: 600,
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
                    borderColor: "#E2E8F0"
                }
            }
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
                        borderColor: "#E2E8F0"
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#CBD5E1"
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
                indicator: { height: 3, borderRadius: "3px 3px 0 0" }
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
                root: { backgroundColor: "#F8FAFC" }
            }
        },

        MuiTableCell: {
            styleOverrides: {
                root: { borderBottom: `1px solid ${BORDER}` },
                head: {
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    color: "#475569",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em"
                }
            }
        },

        MuiTableRow: {
            styleOverrides: {
                root: {
                    "&:hover": { backgroundColor: "#F8FAFC" },
                    "&:last-child td": { borderBottom: 0 }
                }
            }
        }
    }
});

export default theme;
