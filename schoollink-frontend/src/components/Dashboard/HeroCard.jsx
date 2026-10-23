import { Box } from "@mui/material";
import PageHeader from "../common/PageHeader";
function HeroCard() {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const hour = new Date().getHours();
    let greeting = "Good Evening";
    if (hour < 12) {
        greeting = "Good Morning";
    } else if (hour < 17) {
        greeting = "Good Afternoon";
    }
    const today = new Date().toLocaleDateString("en-SG", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
    });
    return (
        <PageHeader
            eyebrow={`${greeting} · ${today}`}
            title={<>{user ? user.full_name : "Welcome"} 👋</>}
            subtitle={<Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>Manage students, attendance, fees & more from one dashboard.</Box>}
        />
    );
}
export default HeroCard;
