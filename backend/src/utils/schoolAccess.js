const pool = require("../config/database");

/**
 * Is this school allowed to use SchoolLink right now?
 * Blocked when the Super Admin has set its status to SUSPENDED
 * or EXPIRED. Cached for 30 seconds so this check adds almost
 * no load. Fails OPEN (allows) if the database check errors, so a
 * hiccup never locks every school out.
 */
const BLOCKED = ["SUSPENDED", "EXPIRED"];

const CACHE_MS = 30 * 1000;

const cache = new Map();

const BLOCKED_MESSAGE =
    "Your school's SchoolLink subscription is not active. " +
    "Please contact your school administrator or SchoolLink support.";

async function isSchoolBlocked(schoolId) {

    if (!schoolId) return false;

    const hit = cache.get(schoolId);

    if (hit && Date.now() - hit.at < CACHE_MS) {

        return hit.blocked;

    }

    try {

        const result = await pool.query(
            `SELECT COALESCE(status, 'ACTIVE') AS status FROM schools WHERE id = $1`,
            [schoolId]
        );

        const row = result.rows[0];

        const blocked = row ? BLOCKED.includes(row.status) : false;

        cache.set(schoolId, { blocked, at: Date.now() });

        return blocked;

    } catch (err) {

        return false;

    }

}

function clearSchoolAccessCache() {

    cache.clear();

}

module.exports = { isSchoolBlocked, clearSchoolAccessCache, BLOCKED_MESSAGE, BLOCKED };
