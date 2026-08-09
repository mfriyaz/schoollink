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
 * history export)
 */
async function getMyNotifications(userId) {

    const result = await db.query(
        `
        SELECT *
        FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 20;
        `,
        [userId]
    );

    return result.rows;

}

/**
 * Get Unread Count
 */
async function getUnreadCount(userId) {

    const result = await db.query(
        `
        SELECT COUNT(*)
        FROM notifications
        WHERE user_id = $1
        AND is_read = false;
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

    getUnreadCount,

    markAsRead,

    markAllAsRead

};
