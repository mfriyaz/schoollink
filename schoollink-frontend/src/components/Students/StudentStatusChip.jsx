import Chip from "@mui/material/Chip";

export default function StudentStatusChip({ active }) {

    return (

        <Chip

            label={active ? "Active" : "Inactive"}

            color={active ? "success" : "default"}

            size="small"

            sx={{

                fontWeight: 600,

                borderRadius: 2

            }}

        />

    );

}