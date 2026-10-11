const webpush = require("web-push");

const db = require("../config/database");

/**
 * Web Push (phone alerts).
 *
 * Needs three variables in backend/.env:
 *   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT
 * If they are missing, push is simply switched off and
 * everything else keeps working.
 */
const enabled = Boolean(
    process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY
);

if (enabled) {

    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || "mailto:admin@schoollink.app",
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );

} else {

    console.log("[push] VAPID keys not set - phone alerts are disabled");

}

function getPublicKey() {

    return enabled ? process.env.VAPID_PUBLIC_KEY : null;

}

async function saveSubscription(userId, sub) {

    await db.query(
        `
        INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (endpoint)
        DO UPDATE SET user_id = EXCLUDED.user_id,
                      p256dh = EXCLUDED.p256dh,
                      auth = EXCLUDED.auth
        `,
        [userId, sub.endpoint, sub.keys.p256dh, sub.keys.auth]
    );

}

async function removeSubscription(userId, endpoint) {

    await db.query(
        `DELETE FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2`,
        [userId, endpoint]
    );

}

/**
 * Send a push to every device of a user. Never throws - a push
 * failure must never break creating a post/announcement.
 */
async function sendToUser(userId, { title, body, url }) {

    if (!enabled) return;

    try {

        const result = await db.query(
            `SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1`,
            [userId]
        );

        const payload = JSON.stringify({ title, body, url: url || "/" });

        await Promise.all(result.rows.map(async (row) => {

            try {

                await webpush.sendNotification(
                    { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
                    payload
                );

            } catch (err) {

                // 404/410 = the phone unsubscribed or the app was removed
                if (err.statusCode === 404 || err.statusCode === 410) {

                    await db.query(
                        `DELETE FROM push_subscriptions WHERE endpoint = $1`,
                        [row.endpoint]
                    );

                } else {

                    console.error("[push] send failed:", err.statusCode || err.message);

                }

            }

        }));

    } catch (err) {

        console.error("[push] error:", err.message);

    }

}

module.exports = { getPublicKey, saveSubscription, removeSubscription, sendToUser };
