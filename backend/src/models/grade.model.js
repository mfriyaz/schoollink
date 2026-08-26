const db = require("../config/database");

/**
 * Create Grade
 */
async function createGrade(data) {

    const query = `
        INSERT INTO grades
        (
            school_id,
            grade_name,
            minimum_percentage,
            maximum_percentage,
            grade_point,
            result
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6
        )
        RETURNING *;
    `;

    const values = [
        data.school_id,
        data.grade_name,
        data.minimum_percentage,
        data.maximum_percentage,
        data.grade_point === "" ? null : data.grade_point,
        data.result
    ];

    const result = await db.query(query, values);

    return result.rows[0];

}

/**
 * Get All Grades
 */
async function getAllGrades(schoolId) {

    const result = await db.query(
        `
        SELECT *
        FROM grades
        WHERE school_id = $1
        ORDER BY maximum_percentage DESC;
        `,
        [schoolId]
    );

    return result.rows;

}

/**
 * Get Grade By ID, scoped to a school
 */
async function getGradeById(id, schoolId) {

    const result = await db.query(
        `
        SELECT *
        FROM grades
        WHERE id = $1 AND school_id = $2;
        `,
        [id, schoolId]
    );

    return result.rows[0];

}

/**
 * Update Grade, scoped to a school
 */
async function updateGrade(id, schoolId, data) {

    const query = `
        UPDATE grades
        SET
            grade_name = $1,
            minimum_percentage = $2,
            maximum_percentage = $3,
            grade_point = $4,
            result = $5
        WHERE id = $6 AND school_id = $7
        RETURNING *;
    `;

    const values = [
        data.grade_name,
        data.minimum_percentage,
        data.maximum_percentage,
        data.grade_point === "" ? null : data.grade_point,
        data.result,
        id,
        schoolId
    ];

    const result = await db.query(query, values);

    return result.rows[0];

}

/**
 * Delete Grade, scoped to a school
 */
async function deleteGrade(id, schoolId) {

    const result = await db.query(
        `
        DELETE FROM grades
        WHERE id = $1 AND school_id = $2
        RETURNING *;
        `,
        [id, schoolId]
    );

    return result.rows[0];

}

/**
 * Find Grade By Percentage
 */
async function findGradeByPercentage(schoolId, percentage) {

    const result = await db.query(
        `
        SELECT *
        FROM grades
        WHERE school_id = $1
        AND $2 BETWEEN minimum_percentage
                 AND maximum_percentage
        LIMIT 1;
        `,
        [
            schoolId,
            percentage
        ]
    );

    return result.rows[0];

}

module.exports = {

    createGrade,

    getAllGrades,

    getGradeById,

    updateGrade,

    deleteGrade,

    findGradeByPercentage

};
