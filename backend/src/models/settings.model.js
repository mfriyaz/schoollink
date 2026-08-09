const db = require("../config/database");

/**
 * Get Settings for a user, creating a default row on first
 * access if one doesn't exist yet.
 */
async function getSettings(userId) {

    const existing = await db.query(
        `SELECT * FROM user_settings WHERE user_id = $1`,
        [userId]
    );

    if (existing.rows[0]) {

        return existing.rows[0];

    }

    const created = await db.query(
        `
        INSERT INTO user_settings (user_id)
        VALUES ($1)
        RETURNING *;
        `,
        [userId]
    );

    return created.rows[0];

}

/**
 * Update Settings
 */
async function updateSettings(userId, data) {

    const query = `
        INSERT INTO user_settings
            (user_id, email_notifications, in_app_notifications)
        VALUES
            ($1, $2, $3)
        ON CONFLICT (user_id)
        DO UPDATE SET
            email_notifications = EXCLUDED.email_notifications,
            in_app_notifications = EXCLUDED.in_app_notifications,
            updated_at = CURRENT_TIMESTAMP
        RETURNING *;
    `;

    const result = await db.query(
        query,
        [userId, data.email_notifications, data.in_app_notifications]
    );

    return result.rows[0];

}

module.exports = {

    getSettings,

    updateSettings

};
