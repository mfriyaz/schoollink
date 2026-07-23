import Typography from "@mui/material/Typography";

function PageTitle({
    title,
    subtitle
}) {
    return (
        <>
            <Typography
                variant="h4"
                sx={{
                    fontWeight: 700,
                    color: "#0F172A"
                }}
            >
                {title}
            </Typography>

            <Typography
                sx={{
                    color: "#64748B",
                    mt: .5,
                    mb: 3
                }}
            >
                {subtitle}
            </Typography>
        </>
    );
}

export default PageTitle;