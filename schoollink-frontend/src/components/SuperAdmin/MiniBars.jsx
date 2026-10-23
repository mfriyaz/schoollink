import { Box, Typography } from "@mui/material";

import { monthLabel } from "../../utils/platformUi";

/** Small dependency-free bar chart: data = [{ month: "2026-05", value: 3 }] */
export default function MiniBars({ data, color = "#3B5BDB", format = (v) => v }) {

    const max = Math.max(1, ...data.map((d) => d.value));

    return (

        <Box sx={{ display: "flex", alignItems: "flex-end", gap: { xs: 0.5, sm: 1 }, height: 150, pt: 2 }}>

            {data.map((d) => (

                <Box key={d.month} sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>

                    <Typography sx={{ fontSize: "0.62rem", color: "#64748B", mb: 0.25, height: 14 }}>
                        {d.value ? format(d.value) : ""}
                    </Typography>

                    <Box
                        title={`${monthLabel(d.month)}: ${format(d.value)}`}
                        sx={{
                            width: "100%",
                            maxWidth: 28,
                            height: `${Math.max(3, (d.value / max) * 100)}%`,
                            bgcolor: d.value ? color : "#E2E8F0",
                            borderRadius: "4px 4px 0 0"
                        }}
                    />

                    <Typography sx={{ fontSize: "0.62rem", color: "#94A3B8", mt: 0.5 }}>
                        {monthLabel(d.month)}
                    </Typography>

                </Box>

            ))}

        </Box>

    );

}
