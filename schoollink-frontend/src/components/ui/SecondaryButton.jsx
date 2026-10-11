import Button from "@mui/material/Button";

function SecondaryButton({
    children,
    ...props
}) {
    return (
        <Button
            variant="outlined"
            sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 600,
                borderColor: "#CBD5E1",
                color: "#334155",

                "&:hover": {
                    borderColor: "var(--sl-primary)",
                    color: "var(--sl-primary)"
                }
            }}
            {...props}
        >
            {children}
        </Button>
    );
}

export default SecondaryButton;