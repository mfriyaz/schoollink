import Typography from "@mui/material/Typography";

function SectionTitle({ children }) {
    return (
        <Typography
            variant="h5"
            sx={{
                fontWeight: 700,
                color: "var(--sl-ink)",
                mb: 2
            }}
        >
            {children}
        </Typography>
    );
}

export default SectionTitle;