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

function PendingStudentsDialog({ open, post, onClose }) {

    if (!post || !post.summary) {

        return null;

    }

    const pendingStudents = post.summary.students.filter(
        (s) => !s.is_acknowledged
    );

    return (

        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>

            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                <Box>

                    <Typography sx={{ fontWeight: 700 }}>

                        Pending Acknowledgements

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

                {pendingStudents.length === 0 && (

                    <Typography color="text.secondary">

                        Everyone has acknowledged this post.

                    </Typography>

                )}

                <List>

                    {pendingStudents.map((student) => (

                        <ListItem key={student.student_id} disableGutters>

                            <ListItemAvatar>

                                <Avatar sx={{ bgcolor: "#FFEDD5", color: "#EA580C" }}>

                                    {student.first_name[0]}

                                </Avatar>

                            </ListItemAvatar>

                            <ListItemText

                                primary={`${student.first_name} ${student.last_name}`}

                                secondary={student.admission_no}

                            />

                            <Chip size="small" color="warning" label="Pending" />

                        </ListItem>

                    ))}

                </List>

            </DialogContent>

        </Dialog>

    );

}

export default PendingStudentsDialog;
