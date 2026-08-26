import {
    Avatar,
    Box,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography
} from "@mui/material";

import CloseIcon from "@mui/icons-material/CloseOutlined";

function AcknowledgedStudentsDialog({ open, post, onClose }) {

    if (!post || !post.summary) {

        return null;

    }

    const acknowledgedStudents = post.summary.students.filter(
        (s) => s.is_acknowledged
    );

    return (

        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>

            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                <Box>

                    <Typography sx={{ fontWeight: 700 }}>

                        Acknowledged

                    </Typography>

                    <Typography sx={{ color: "#64748B", fontSize: "0.82rem", fontWeight: 400 }}>

                        {post.title}

                    </Typography>

                </Box>

                <IconButton onClick={onClose} size="small">

                    <CloseIcon fontSize="small" />

                </IconButton>

            </DialogTitle>

            <DialogContent>

                {acknowledgedStudents.length === 0 && (

                    <Typography color="text.secondary">

                        No one has acknowledged this post yet.

                    </Typography>

                )}

                <List>

                    {acknowledgedStudents.map((student) => (

                        <ListItem key={student.student_id} disableGutters>

                            <ListItemAvatar>

                                <Avatar sx={{ bgcolor: "#DCFCE7", color: "#16A34A" }}>

                                    {student.first_name[0]}

                                </Avatar>

                            </ListItemAvatar>

                            <ListItemText

                                primary={`${student.first_name} ${student.last_name}`}

                                secondary={

                                    student.acknowledged_at

                                        ? `${student.admission_no} · ${new Date(student.acknowledged_at).toLocaleDateString()}`

                                        : student.admission_no

                                }

                            />

                            <Chip size="small" color="success" label="Acknowledged" />

                        </ListItem>

                    ))}

                </List>

            </DialogContent>

        </Dialog>

    );

}

export default AcknowledgedStudentsDialog;
