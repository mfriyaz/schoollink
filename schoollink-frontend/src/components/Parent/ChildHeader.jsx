import { Box } from "@mui/material";
import PageHeader from "../common/PageHeader";

/**
 * Name header at the top of every parent screen: child's name and class,
 * a small line above it (greeting or screen name), and round buttons to switch child.
 */
export default function ChildHeader({ child, kids = [], selectedId, onSelect, eyebrow }) {
    const name = child ? `${child.first_name} ${child.last_name || ""}`.trim() : "Your child";

    return (
        <PageHeader
            avatar={child ? (child.first_name || "?")[0].toUpperCase() : "?"}
            avatarSize={46}
            eyebrow={eyebrow}
            title={
                <>
                    {name}
                    {child && (
                        <Box component="span" sx={{ fontWeight: 600, fontSize: "0.82rem", color: "text.secondary", ml: 1 }}>
                            {child.class_name} - {child.section_name}
                        </Box>
                    )}
                </>
            }
            action={kids.length > 1 ? (
                <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                    {kids.map((c) => {
                        const on = c.student_id === selectedId;
                        return (
                            <Box
                                key={c.student_id}
                                role="button"
                                tabIndex={0}
                                aria-pressed={on}
                                onClick={() => onSelect(c.student_id)}
                                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(c.student_id); } }}
                                sx={{
                                    px: 1.5, py: 0.5, borderRadius: 99, cursor: "pointer", userSelect: "none",
                                    fontSize: "0.82rem", fontWeight: 800, color: "var(--sl-ink, #111827)",
                                    border: "1.5px solid var(--sl-ink, #111827)",
                                    bgcolor: on ? "var(--sl-accent, #FFC400)" : "transparent",
                                    boxShadow: on ? "2px 2px 0 var(--sl-ink, #111827)" : "none",
                                    "&:hover": { bgcolor: on ? "var(--sl-accent, #FFC400)" : "var(--sl-soft, #F8FAFC)" }
                                }}
                            >
                                {c.first_name}
                            </Box>
                        );
                    })}
                </Box>
            ) : null}
        />
    );
}
