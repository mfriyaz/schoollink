import { useState } from "react";

import {
    Box,
    IconButton,
    Tooltip
} from "@mui/material";

import { reactToGreeting } from "../../services/morningGreetingService";

export const reactions = [

    { key: "good", emoji: "👍", label: "Good" },

    { key: "nice", emoji: "⭐", label: "Nice" },

    { key: "great", emoji: "🎉", label: "Great" },

    { key: "good_job", emoji: "💯", label: "Good Job" }

];

/**
 * Small emoji-reaction row for a teacher to respond to a
 * parent's Good Morning voice message - same pattern as the
 * reaction picker on homework photo submissions.
 */
function GreetingReactionPicker({ greeting, onReacted }) {

    const [saving, setSaving] = useState(false);

    async function handleReact(reactionKey) {

        if (saving) {

            return;

        }

        try {

            setSaving(true);

            const response = await reactToGreeting(greeting.id, reactionKey);

            if (response.success) {

                onReacted?.(response.data);

            }

        } catch (err) {

            console.error(err);

        } finally {

            setSaving(false);

        }

    }

    return (

        <Box sx={{ display: "flex", gap: 0.5 }}>

            {reactions.map((r) => {

                const selected = greeting.teacher_reaction === r.key;

                return (

                    <Tooltip key={r.key} title={r.label}>

                        <IconButton

                            size="small"

                            onClick={() => handleReact(r.key)}

                            disabled={saving}

                            sx={{

                                fontSize: "1rem",

                                bgcolor: selected ? "#DCFCE7" : "transparent",

                                border: selected ? "2px solid #16A34A" : "2px solid transparent",

                                "&:hover": {

                                    bgcolor: selected ? "#DCFCE7" : "#F1F5F9"

                                }

                            }}

                        >

                            {r.emoji}

                        </IconButton>

                    </Tooltip>

                );

            })}

        </Box>

    );

}

export default GreetingReactionPicker;
