const db = require("../config/database");

/**
 * Create a Notification
 */
async function createNotification(data) {

    const query = `
        INSERT INTO notifications
        (user_id, title, message, link)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;

    const result = await db.query(
        query,
        [data.user_id, data.title, data.message, data.link]
    );

    return result.rows[0];

}

/**
 * Get My Notifications
 * (most recent first, capped - this is a feed, not a full
 * history export. Excludes expired ones - see
 * getExpiredNotifications for those.)
 */
async function getMyNotifications(userId) {

    const result = await db.query(
        `
        SELECT *
        FROM notifications
        WHERE user_id = $1
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
        ORDER BY created_at DESC
        LIMIT 20;
        `,
        [userId]
    );

    return result.rows;

}

/**
 * Get Expired Notifications
 * (a separate history view, rather than expired ones just
 * disappearing entirely)
 */
async function getExpiredNotifications(userId) {

    const result = await db.query(
        `
        SELECT *
        FROM notifications
        WHERE user_id = $1
        AND expires_at IS NOT NULL
        AND expires_at <= CURRENT_TIMESTAMP
        ORDER BY created_at DESC
        LIMIT 50;
        `,
        [userId]
    );

    return result.rows;

}

/**
 * Get Unread Count
 * (excludes expired ones, so the bell badge doesn't count
 * things that no longer show in the main feed)
 */
async function getUnreadCount(userId) {

    const result = await db.query(
        `
        SELECT COUNT(*)
        FROM notifications
        WHERE user_id = $1
        AND is_read = false
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP);
        `,
        [userId]
    );

    return Number(result.rows[0].count);

}

/**
 * Mark One Notification As Read
 */
async function markAsRead(id, userId) {

    const result = await db.query(
        `
        UPDATE notifications
        SET is_read = true
        WHERE id = $1
        AND user_id = $2
        RETURNING *;
        `,
        [id, userId]
    );

    return result.rows[0];

}

/**
 * Mark All As Read
 */
async function markAllAsRead(userId) {

    await db.query(
        `
        UPDATE notifications
        SET is_read = true
        WHERE user_id = $1
        AND is_read = false;
        `,
        [userId]
    );

    return true;

}

module.exports = {

    createNotification,

    getMyNotifications,

    getExpiredNotifications,

    getUnreadCount,

    markAsRead,

    markAllAsRead

};
