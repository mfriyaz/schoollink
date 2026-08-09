import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography
} from "@mui/material";

function BulkImportResultDialog({ open, result, onClose }) {

    if (!result) {

        return null;

    }

    return (

        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>

            <DialogTitle sx={{ fontWeight: 700 }}>

                Import Results

            </DialogTitle>

            <DialogContent>

                <Alert
                    severity={result.failed_count === 0 ? "success" : "warning"}
                    sx={{ mb: 2 }}
                >

                    {result.created_count} of {result.total_rows} students imported successfully.
                    {result.failed_count > 0 && ` ${result.failed_count} failed.`}

                </Alert>

                {result.failed.length > 0 && (

                    <Box>

                        <Typography sx={{ fontWeight: 600, mb: 1 }}>

                            Failed Rows

                        </Typography>

                        {result.failed.map((f, index) => (

                            <Box

                                key={index}

                                sx={{

                                    py: 1,

                                    borderBottom: "1px solid #F1F5F9",

                                    "&:last-of-type": { borderBottom: "none" }

                                }}

                            >

                                <Typography sx={{ fontWeight: 500, fontSize: "0.88rem" }}>

                                    Row {f.row} ({f.admission_no})

                                </Typography>

                                <Typography sx={{ color: "#DC2626", fontSize: "0.82rem" }}>

                                    {f.reason}

                                </Typography>

                            </Box>

                        ))}

                    </Box>

                )}

            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>

                <Button variant="contained" onClick={onClose}>Close</Button>

            </DialogActions>

        </Dialog>

    );

}

export default BulkImportResultDialog;
