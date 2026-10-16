import { useState } from "react";
import { Alert, Box, Button, Card, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircleRounded";
import PaletteIcon from "@mui/icons-material/PaletteOutlined";
import { useAppTheme } from "../../theme/ThemeProvider";
/** School Admin: pick the colour theme for the whole school (preview before saving) */
export default function ThemePicker() {
    const { themes, themeId, savedId, preview, cancelPreview, save } = useAppTheme();
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const dirty = themeId !== savedId;
    async function handleSave() {
        setSaving(true);
        setMessage(null);
        try {
            const res = await save(themeId);
            setMessage(res?.success
                ? { type: "success", text: "Theme saved. Teachers and parents will see it the next time they open the app." }
                : { type: "error", text: res?.message || "Unable to save the theme." });
        } catch (err) {
            setMessage({ type: "error", text: err.response?.data?.message || "Unable to save the theme." });
        } finally {
            setSaving(false);
        }
    }
    return (
        <Card sx={{ p: { xs: 2, md: 3 }, mt: 2.5, borderRadius: 3, border: "1px solid var(--sl-border)", boxShadow: "var(--sl-card-shadow)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.75 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: "12px", bgcolor: "#EDE9FE", border: "1.5px solid var(--sl-ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <PaletteIcon sx={{ color: "#7C3AED", fontSize: 21 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--sl-ink)" }}>Appearance</Typography>
            </Box>
            <Typography sx={{ color: "text.secondary", fontSize: "0.85rem", mb: 2.5 }}>
                Choose the colour theme for your school. Tap one to preview it, then save.
            </Typography>
            {message && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 1.5 }}>
                {themes.map((t) => {
                    const selected = t.id === themeId;
                    return (
                        <Box
                            key={t.id}
                            role="button"
                            tabIndex={0}
                            aria-pressed={selected}
                            onClick={() => preview(t.id === savedId ? null : t.id)}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); preview(t.id === savedId ? null : t.id); } }}
                            sx={{
                                position: "relative",
                                cursor: "pointer",
                                borderRadius: "16px",
                                p: 1.25,
                                border: "2px solid",
                                borderColor: selected ? "var(--sl-ink)" : "var(--sl-border)",
                                boxShadow: selected ? "3px 3px 0 var(--sl-ink)" : "none",
                                bgcolor: "#fff",
                                transition: "all .15s ease",
                                "&:hover": { transform: "translateY(-2px)" },
                                "&:focus-visible": { outline: "3px solid var(--sl-accent)" }
                            }}
                        >
                            {/* Mini preview: menu + highlight + button */}
                            <Box sx={{ display: "flex", height: 70, borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(0,0,0,0.06)" }}>
                                <Box sx={{ width: "32%", background: t.sideBg, p: 0.75 }}>
                                    <Box sx={{ height: 9, borderRadius: "4px", background: t.sideActive, mb: 0.6 }} />
                                    <Box sx={{ height: 6, borderRadius: "3px", bgcolor: "rgba(255,255,255,0.22)", mb: 0.5 }} />
                                    <Box sx={{ height: 6, borderRadius: "3px", bgcolor: "rgba(255,255,255,0.22)" }} />
                                </Box>
                                <Box sx={{ flex: 1, bgcolor: t.pageBg, p: 0.75 }}>
                                    <Box sx={{ height: 8, width: "60%", borderRadius: "4px", bgcolor: t.primary, mb: 0.75 }} />
                                    <Box sx={{ height: 14, borderRadius: "6px", bgcolor: t.soft, mb: 0.75 }} />
                                    <Box sx={{ height: 11, width: "50%", borderRadius: "6px", background: t.btnBg }} />
                                </Box>
                            </Box>
                            <Box sx={{ display: "flex", gap: 0.5, mt: 1 }}>
                                {[t.primary, t.accent, t.soft2].map((c) => (
                                    <Box key={c} sx={{ width: 16, height: 16, borderRadius: "50%", bgcolor: c, border: "1px solid rgba(0,0,0,0.12)" }} />
                                ))}
                            </Box>
                            <Typography sx={{ fontWeight: 700, fontSize: "0.92rem", mt: 0.75, lineHeight: 1.2 }}>{t.name}</Typography>
                            <Typography sx={{ color: "text.secondary", fontSize: "0.75rem" }}>{t.tagline}</Typography>
                            {selected && <CheckCircleIcon sx={{ position: "absolute", top: 8, right: 8, color: t.primary, bgcolor: "#fff", borderRadius: "50%" }} />}
                        </Box>
                    );
                })}
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2.5 }}>
                {dirty && <Button variant="text" onClick={cancelPreview} disabled={saving}>Cancel</Button>}
                <Button variant="contained" onClick={handleSave} loading={saving} loadingPosition="start" disabled={!dirty || saving}>
                    Save Theme
                </Button>
            </Box>
        </Card>
    );
}
