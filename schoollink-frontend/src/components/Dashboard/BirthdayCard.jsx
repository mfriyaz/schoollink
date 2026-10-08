import { Avatar, Box, Typography } from "@mui/material";
import CakeIcon from "@mui/icons-material/Cake";
import PanelCard, { EmptyState } from "./PanelCard";

function BirthdayCard({ birthdays }) {
    const list = birthdays || [];

    return (
        <PanelCard title="🎉 Today's Birthdays" subtitle="Students celebrating today">
            {list.length === 0 && (
                <EmptyState icon={<CakeIcon />} text="No birthdays today." />
            )}

            {list.map((student, index) => (
                <Box
                    key={student.id}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        py: 1.1,
                        borderTop: index === 0 ? "none" : "1px solid #F1F5F9"
                    }}
                >
                    <Avatar
                        sx={{
                            width: 36,
                            height: 36,
                            fontSize: "0.9rem",
                            fontWeight: 700,
                            bgcolor: "#DB2777"
                        }}
                    >
                        {student.first_name?.[0]}
                    </Avatar>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                        {student.first_name} {student.last_name}
                    </Typography>
                </Box>
            ))}
        </PanelCard>
    );
}

export default BirthdayCard;
