import { createTheme } from "@mui/material/styles";

const theme = createTheme({

    palette: {

        mode: "light",

        primary: {

            main: "#2563EB"

        },

        secondary: {

            main: "#7C3AED"

        },

        success: {

            main: "#22C55E"

        },

        warning: {

            main: "#F59E0B"

        },

        error: {

            main: "#EF4444"

        },

        background: {

            default: "#F5F7FB",

            paper: "#FFFFFF"

        },

        text: {

            primary: "#111827",

            secondary: "#6B7280"

        }

    },

    shape: {

        borderRadius: 12

    },

    typography: {

        fontFamily: [
            "Inter",
            "Segoe UI",
            "Roboto",
            "Helvetica",
            "Arial",
            "sans-serif"
        ].join(","),

        h4: {

            fontWeight: 700,

            fontSize: "1.8rem"

        },

        h5: {

            fontWeight: 700

        },

        h6: {

            fontWeight: 600

        },

        button: {

            textTransform: "none",

            fontWeight: 600

        }

    },

    components: {

        MuiPaper: {

            styleOverrides: {

                root: {

                    borderRadius: 16,

                    boxShadow:
                        "0 8px 30px rgba(15,23,42,0.06)"

                }

            }

        },

        MuiCard: {

            styleOverrides: {

                root: {

                    borderRadius: 16,

                    boxShadow:
                        "0 8px 30px rgba(15,23,42,0.06)"

                }

            }

        },

        MuiButton: {

            styleOverrides: {

                root: {

                    borderRadius: 10,

                    fontWeight: 600,

                    paddingLeft: 20,

                    paddingRight: 20,

                    paddingTop: 10,

                    paddingBottom: 10

                }

            }

        },

        MuiTextField: {

            defaultProps: {

                variant: "outlined",

                size: "small"

            }

        },

        MuiOutlinedInput: {

            styleOverrides: {

                root: {

                    borderRadius: 10

                }

            }

        },

        MuiTableHead: {

            styleOverrides: {

                root: {

                    backgroundColor: "#F9FAFB"

                }

            }

        },

        MuiTableCell: {

            styleOverrides: {

                head: {

                    fontWeight: 700,

                    color: "#374151"

                }

            }

        },

        MuiDialog: {

            styleOverrides: {

                paper: {

                    borderRadius: 18

                }

            }

        }

    }

});

export default theme;