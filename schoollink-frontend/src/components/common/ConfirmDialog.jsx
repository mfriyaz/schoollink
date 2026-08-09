import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography
} from "@mui/material";

function ConfirmDialog({

    open,

    title,

    message,

    confirmLabel = "Confirm",

    confirmColor = "primary",

    onConfirm,

    onCancel

}) {

    return (

        <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>

            <DialogTitle sx={{ fontWeight: 700 }}>

                {title}

            </DialogTitle>

            <DialogContent>

                <Typography sx={{ color: "#334155" }}>

                    {message}

                </Typography>

            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>

                <Button onClick={onCancel}>Cancel</Button>

                <Button variant="contained" color={confirmColor} onClick={onConfirm}>

                    {confirmLabel}

                </Button>

            </DialogActions>

        </Dialog>

    );

}

export default ConfirmDialog;
