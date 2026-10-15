import { useRef, useState } from "react";

import { Box, Button, IconButton, Menu, MenuItem, TextField, Typography } from "@mui/material";

import SearchIcon from "@mui/icons-material/SearchRounded";
import PersonAddIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import MoreVertIcon from "@mui/icons-material/MoreVertRounded";

/**
 * Header of the Students page: title, Add Student, and a menu for the
 * Excel template and bulk upload.
 */
export default function StudentToolbar({ total, onAdd, onDownloadTemplate, onUploadFile, uploading }) {

    const fileInputRef = useRef(null);
    const [anchor, setAnchor] = useState(null);

    function handleFileSelected(event) {
        const file = event.target.files[0];
        if (file) onUploadFile(file);
        event.target.value = "";
    }

    return (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, gap: 1.5, flexWrap: "wrap" }}>

            <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>Students</Typography>
                <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>{total} students in your school</Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <IconButton aria-label="Import options" onClick={(e) => setAnchor(e.currentTarget)} disabled={uploading}>
                    <MoreVertIcon />
                </IconButton>
                <Button variant="contained" startIcon={<PersonAddIcon />} onClick={onAdd}>
                    Add Student
                </Button>
            </Box>

            <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
                <MenuItem onClick={() => { setAnchor(null); onDownloadTemplate(); }}>Download Excel template</MenuItem>
                <MenuItem onClick={() => { setAnchor(null); fileInputRef.current?.click(); }}>
                    {uploading ? "Uploading..." : "Bulk upload from Excel"}
                </MenuItem>
            </Menu>

            <input type="file" hidden accept=".xlsx,.xls" ref={fileInputRef} onChange={handleFileSelected} />

        </Box>
    );
}

export function SearchField({ value, onChange }) {
    return (
        <TextField
            size="small"
            placeholder="Search name, admission no, parent or phone"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            sx={{ flex: "1 1 260px", maxWidth: 440 }}
            slotProps={{
                input: { startAdornment: <SearchIcon fontSize="small" sx={{ mr: 0.75, color: "text.secondary" }} /> }
            }}
        />
    );
}
