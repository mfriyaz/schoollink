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
                    "linear-gradient(90deg,#2563EB,#4F46E5)",

                "&:hover": {
                    background:
                        "linear-gradient(90deg,#1D4ED8,#4338CA)"
                }
            }}
            {...props}
        >
            {children}
        </Button>
    );
}

export default PrimaryButton;