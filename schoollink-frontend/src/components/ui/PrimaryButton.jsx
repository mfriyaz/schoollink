import Button from "@mui/material/Button";

function PrimaryButton({
    children,
    ...props
}) {
    return (
        <Button
            variant="contained"
            disableElevation
            sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 600,
                padding: "10px 22px",
                background:
                    "linear-gradient(90deg,var(--sl-primary),var(--sl-primary))",

                "&:hover": {
                    background:
                        "linear-gradient(90deg,var(--sl-primary-dark),var(--sl-primary-dark))"
                }
            }}
            {...props}
        >
            {children}
        </Button>
    );
}

export default PrimaryButton;