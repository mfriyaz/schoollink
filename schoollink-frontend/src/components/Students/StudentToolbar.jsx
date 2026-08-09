import { useRef } from "react";

import {
    Box,
    Typography,
    Button,
    TextField,
    InputAdornment
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DownloadIcon from "@mui/icons-material/DownloadOutlined";
import UploadFileIcon from "@mui/icons-material/UploadFileOutlined";

export default function StudentToolbar({

    search,

    setSearch,

    onAdd,

    onDownloadTemplate,

    onUploadFile,

    uploading

}) {

    const fileInputRef = useRef(null);

    function handleUploadClick() {

        fileInputRef.current?.click();

    }

    function handleFileSelected(event) {

        const file = event.target.files[0];

        if (file) {

            onUploadFile(file);

        }

        event.target.value = "";

    }

    return (

        <Box

            sx={{

                display: "flex",

                justifyContent: "space-between",

                alignItems: "center",

                mb: 3,

                flexWrap: "wrap",

                gap: 2

            }}

        >

            <Typography

                variant="h4"

                fontWeight={700}

            >

                Students

            </Typography>

            <Box

                sx={{

                    display: "flex",

                    gap: 2,

                    flexWrap: "wrap"

                }}

            >

                <TextField

                    size="small"

                    placeholder="Search student..."

                    value={search}

                    onChange={(e) =>
                        setSearch(e.target.value)
                    }

                    InputProps={{

                        startAdornment: (

                            <InputAdornment position="start">

                                <SearchIcon />

                            </InputAdornment>

                        )

                    }}

                    sx={{

                        width: 220

                    }}

                />

                <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={onDownloadTemplate}
                    sx={{ borderRadius: 3 }}
                >

                    Template

                </Button>

                <Button
                    variant="outlined"
                    startIcon={<UploadFileIcon />}
                    onClick={handleUploadClick}
                    disabled={uploading}
                    sx={{ borderRadius: 3 }}
                >

                    {uploading ? "Uploading..." : "Bulk Upload"}

                </Button>

                <input
                    type="file"
                    hidden
                    accept=".xlsx,.xls"
                    ref={fileInputRef}
                    onChange={handleFileSelected}
                />

                <Button

                    variant="contained"

                    startIcon={<PersonAddIcon />}

                    onClick={onAdd}

                    sx={{

                        borderRadius: 3,

                        px: 3

                    }}

                >

                    Add Student

                </Button>

            </Box>

        </Box>

    );

}
