import Typography from "@mui/material/Typography";

function SectionTitle({ children }) {
    return (
        <Typography
            variant="h5"
            sx={{
                fontWeight: 700,
                color: "#0F172A",
                mb: 2
            }}
        >
            {children}
        </Typography>
    );
}

export default SectionTitle;