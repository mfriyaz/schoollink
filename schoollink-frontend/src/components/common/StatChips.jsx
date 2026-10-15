import { Box, Typography } from "@mui/material";

/**
 * Small count chips at the top of a list page.
 *   items   [{ label, value, filter, tone }]
 *   active  the selected filter id
 *   onPick  called with the item's filter id
 */
export default function StatChips({ items, active, onPick }) {
    return (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: `repeat(${items.length}, 1fr)` }, gap: 1, mb: 1.5 }}>
            {items.map((s) => (
                <Box
                    key={s.label}
                    onClick={() => onPick && s.filter && onPick(s.filter)}
                    sx={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 0.75,
                        px: 1.5,
                        py: 0.75,
                        cursor: onPick && s.filter ? "pointer" : "default",
                        borderRadius: 2,
                        bgcolor: "#fff",
                        border: "1px solid var(--sl-border, #EEF2F7)",
                        outline: active && active === s.filter ? "2px solid var(--sl-accent, var(--sl-primary))" : "none"
                    }}
                >
                    <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", lineHeight: 1.2, color: s.tone || "var(--sl-ink, var(--sl-ink))" }}>
                        {s.value}
                    </Typography>
                    <Typography sx={{ fontSize: "0.76rem", color: "text.secondary" }} noWrap>{s.label}</Typography>
                </Box>
            ))}
        </Box>
    );
}
