const pool = require("../config/database");
const response = require("../utils/response");

// Must match the ids in schoollink-frontend/src/theme/themes.js
const THEMES = ["sunshine", "sky", "maroon", "coral", "mint", "butter"];

/**
 * Any logged-in user: the colour theme chosen by their school
 */
async function getSchoolTheme(req, res) {

    try {

        const result = await pool.query(
            "SELECT theme FROM schools WHERE id = $1",
            [req.user.school_id]
        );

        const theme = result.rows[0]?.theme;

        return response.success(
            res,
            { theme: THEMES.includes(theme) ? theme : "sunshine" },
            "Theme retrieved successfully"
        );

    } catch (err) {

        // A missing column (migration not run yet) must never break the app
        return response.success(res, { theme: "sunshine" }, "Default theme");

    }

}

/**
 * School Admin only: this school's own subscription dates (read only),
 * so the app can show a renewal reminder. Always the caller's own school.
 */
async function getSubscriptionNotice(req, res) {

    try {

        const result = await pool.query(
            `SELECT (subscription_expiry::date - CURRENT_DATE)::int AS days_left,
                    to_char(subscription_expiry::date, 'YYYY-MM-DD') AS expiry, status
               FROM schools WHERE id = $1`,
            [req.user.school_id]
        );

        const row = result.rows[0] || {};

        const daysLeft = row.days_left === null || row.days_left === undefined ? null : row.days_left;

        return response.success(
            res,
            { days_left: daysLeft, expiry: row.expiry || null, status: row.status || null },
            "Subscription notice"
        );

    } catch (err) {

        return response.success(res, { days_left: null, expiry: null, status: null }, "No notice");

    }

}

/**
 * School Admin only: choose the theme for the whole school
 */
async function updateSchoolTheme(req, res) {

    try {

        const { theme } = req.body;

        if (!THEMES.includes(theme)) {

            return response.error(res, "Please choose a valid theme.", 400);

        }

        await pool.query(
            "UPDATE schools SET theme = $1 WHERE id = $2",
            [theme, req.user.school_id]
        );

        return response.success(res, { theme }, "Theme saved successfully");

    } catch (err) {

        return response.error(res, err.message, 500);

    }

}

module.exports = {
    getSubscriptionNotice,

    getSchoolTheme,

    updateSchoolTheme

};
