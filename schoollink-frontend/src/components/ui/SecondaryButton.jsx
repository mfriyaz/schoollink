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
                    borderColor: "#2563EB",
                    color: "#2563EB"
                }
            }}
            {...props}
        >
            {children}
        </Button>
    );
}

export default SecondaryButton;