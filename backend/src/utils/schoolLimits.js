const pool = require("../config/database");

const resourceConfig = {

    students: {

        table: "students",

        limitColumn: "max_students",

        label: "students"

    },

    teachers: {

        table: "teachers",

        limitColumn: "max_teachers",

        label: "teachers"

    },

    classes: {

        table: "classes",

        limitColumn: "max_classes",

        label: "classes"

    }

};

/**
 * Throws if the school has already reached its Super
 * Admin-configured limit for this resource type. A NULL limit
 * means unlimited (the default for schools nobody has
 * configured yet), so nothing is blocked until a Super Admin
 * actually sets a cap.
 */
async function assertUnderLimit(schoolId, resourceType) {

    const config = resourceConfig[resourceType];

    if (!config) {

        throw new Error(`Unknown resource type: ${resourceType}`);

    }

    const schoolResult = await pool.query(
        `SELECT ${config.limitColumn} FROM schools WHERE id = $1`,
        [schoolId]
    );

    const limit = schoolResult.rows[0]
        ? schoolResult.rows[0][config.limitColumn]
        : null;

    if (limit === null || limit === undefined) {

        return;

    }

    const countResult = await pool.query(
        `SELECT COUNT(*) FROM ${config.table} WHERE school_id = $1 AND is_active = true`,
        [schoolId]
    );

    const currentCount = Number(countResult.rows[0].count);

    if (currentCount >= limit) {

        throw new Error(
            `This school has reached its limit of ${limit} ${config.label}. Contact your platform administrator to increase it.`
        );

    }

}

module.exports = {

    assertUnderLimit

};
