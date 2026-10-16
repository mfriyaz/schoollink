import { Typography } from "@mui/material";
function SectionTitle({
    children
}){
    return(
        <Typography
            fontWeight={800}
            sx={{
                fontSize: { xs: "1.1rem", md: "1.25rem" },
                color: "var(--sl-ink)",
                mb: 1.5,
                mt: 1
            }}
        >
            {children}
        </Typography>
    );
}
export default SectionTitle;