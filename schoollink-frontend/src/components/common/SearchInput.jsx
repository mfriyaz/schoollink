import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";

import SearchIcon from "@mui/icons-material/Search";

function SearchInput({
    value,
    onChange,
    placeholder
}) {
    return (
        <TextField
            fullWidth
            size="small"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon />
                    </InputAdornment>
                )
            }}
            sx={{
                maxWidth: 360,

                "& .MuiOutlinedInput-root": {
                    borderRadius: "14px"
                }
            }}
        />
    );
}

export default SearchInput;