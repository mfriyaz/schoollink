import { Card } from "@mui/material";

function AppCard({ children, sx = {} }) {
    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: "20px",
                padding: 3,
                background: "#FFFFFF",
                border: "1px solid #EEF2F7",
                boxShadow: "0 10px 35px rgba(15,23,42,0.06)",
                transition: "all .25s ease",

                "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 16px 40px rgba(37,99,235,.12)"
                },

                ...sx
            }}
        >
            {children}
        </Card>
    );
}

export default AppCard;