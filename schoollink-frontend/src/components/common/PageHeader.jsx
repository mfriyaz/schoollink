import { Box, Typography } from "@mui/material";

/**
 * Light page header used across the portals: no coloured bar, just a name,
 * a small line above it, an optional round avatar and an optional action on the right.
 * Colours come from the theme, so it follows whichever theme is chosen.
 */
export default function PageHeader({ eyebrow, title, subtitle, avatar, avatarSize = 44, action, children, mb }) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
                pb: { xs: 1.75, sm: 2.25 },
                mb: mb || { xs: 2, sm: 2.5 },
                borderBottom: "1px solid var(--sl-border, #E5E7EB)"
            }}
        >
            {avatar && (
                <Box
                    sx={{
                        width: avatarSize, height: avatarSize, minWidth: avatarSize, borderRadius: "50%",
                        bgcolor: "var(--sl-accent, #FFC400)", color: "var(--sl-ink, #111827)",
                        border: "1.5px solid var(--sl-ink, #111827)", boxShadow: "2px 2px 0 var(--sl-ink, #111827)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, fontSize: avatarSize > 56 ? "1.6rem" : "1.1rem"
                    }}
                >
                    {avatar}
                </Box>
            )}

            <Box sx={{ minWidth: 0, flex: 1 }}>
                {eyebrow && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.9 }}>
                        <Box sx={{ width: 8, height: 8, minWidth: 8, borderRadius: "50%", bgcolor: "var(--sl-accent, #FFC400)", border: "1.5px solid var(--sl-ink, #111827)" }} />
                        <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "text.secondary", letterSpacing: 0.2 }} noWrap>
                            {eyebrow}
                        </Typography>
                    </Box>
                )}
                <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.3rem", sm: "1.6rem" }, lineHeight: 1.2, mt: eyebrow ? 0.4 : 0, color: "var(--sl-ink, #111827)" }} noWrap>
                    {title}
                </Typography>
                {subtitle && (
                    <Typography sx={{ mt: 0.3, fontSize: "0.85rem", color: "text.secondary" }}>
                        {subtitle}
                    </Typography>
                )}
                {children}
            </Box>

            {action && <Box sx={{ flexShrink: 0, width: { xs: "100%", sm: "auto" } }}>{action}</Box>}
        </Box>
    );
}
