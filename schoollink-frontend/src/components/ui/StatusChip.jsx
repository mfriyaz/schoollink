import Chip from "@mui/material/Chip";

function StatusChip({ active }) {
    return (
        <Chip
            label={active ? "Active" : "Inactive"}
            size="small"
            sx={{
                borderRadius: "8px",
                fontWeight: 600,

                background: active
                    ? "#DCFCE7"
                    : "#FEE2E2",

                color: active
                    ? "#15803D"
                    : "#DC2626"
            }}
        />
    );
}

export default StatusChip;