import { Avatar, Box, Chip, Typography } from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PanelCard, { EmptyState } from "./PanelCard";

const avatarColors = ["#2563EB", "#16A34A", "#EA580C", "#7C3AED", "#DB2777"];

function RecentStudentCard({ students }) {
    const list = students || [];

    return (
        <PanelCard title="Recently Added Students" subtitle="Newest admissions">
            {list.length === 0 && (
                <EmptyState icon={<PeopleAltIcon />} text="No students added yet." />
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
                            bgcolor: avatarColors[index % avatarColors.length]
                        }}
                    >
                        {student.first_name?.[0]}
                    </Avatar>

                    <Typography
                        sx={{
                            flex: 1,
                            minWidth: 0,
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        }}
                    >
                        {student.first_name} {student.last_name}
                    </Typography>

                    {student.admission_no && (
                        <Chip
                            size="small"
                            label={student.admission_no}
                            sx={{ height: 22, fontSize: "0.72rem", bgcolor: "#F1F5F9", color: "#475569" }}
                        />
                    )}
                </Box>
            ))}
        </PanelCard>
    );
}

export default RecentStudentCard;
