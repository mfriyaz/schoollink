const db = require("../config/database");

/**
 * Create Teacher
 */
async function createTeacher(data) {

    const query = `
        INSERT INTO teachers
        (
            school_id,
            user_id,
            employee_no,
            first_name,
            last_name,
            gender,
            date_of_birth,
            phone,
            email,
            address,
            qualification,
            experience_years,
            joining_date
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
        )
        RETURNING *;
    `;

    const values = [
        data.school_id,
        data.user_id,
        data.employee_no,
        data.first_name,
        data.last_name,
        data.gender,
        data.date_of_birth,
        data.phone,
        data.email,
        data.address,
        data.qualification,
        data.experience_years,
        data.joining_date
    ];

    const result = await db.query(query, values);

    return result.rows[0];
}

/**
 * Get All Teachers By School
 */
async function getTeachersBySchool(schoolId) {

    const query = `
        SELECT *
        FROM teachers
        WHERE school_id = $1
        ORDER BY first_name;
    `;

    const result = await db.query(query, [schoolId]);

    return result.rows;
}

/**
 * Get Teacher By ID
 */
async function getTeacherById(id, schoolId) {

    const result = await db.query(
        "SELECT * FROM teachers WHERE id = $1 AND school_id = $2",
        [id, schoolId]
    );

    return result.rows[0];
}

/**
 * Get Teacher By User ID
 * (resolves a logged-in Teacher's JWT user id -> teacher_id,
 * needed since the JWT only carries the users.id, not teachers.id)
 */
async function getTeacherByUserId(userId) {

    const result = await db.query(
        "SELECT * FROM teachers WHERE user_id = $1",
        [userId]
    );

    return result.rows[0];
}

/**
 * Update Teacher
 */
async function updateTeacher(id, schoolId, data) {

    const query = `
        UPDATE teachers
        SET
            employee_no = $1,
            first_name = $2,
            last_name = $3,
            gender = $4,
            date_of_birth = $5,
            phone = $6,
            email = $7,
            address = $8,
            qualification = $9,
            experience_years = $10,
            joining_date = $11,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $12
        AND school_id = $13
        RETURNING *;
    `;

    const values = [
        data.employee_no,
        data.first_name,
        data.last_name,
        data.gender,
        data.date_of_birth,
        data.phone,
        data.email,
        data.address,
        data.qualification,
        data.experience_years,
        data.joining_date,
        id,
        schoolId
    ];

    const result = await db.query(query, values);

    return result.rows[0];
}

/**
 * Deactivate Teacher
 * (soft delete - a teacher with existing homework/attendance/
 * marks tied to them can't be safely erased outright without
 * either orphaning that history or crashing on the foreign key
 * constraint, so this deactivates them instead)
 */
async function deactivateTeacher(id, schoolId) {

    const result = await db.query(
        `
        UPDATE teachers
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND school_id = $2
        RETURNING *
        `,
        [id, schoolId]
    );

    return result.rows[0];
}

/**
 * Reactivate Teacher
 */
async function reactivateTeacher(id, schoolId) {

    const result = await db.query(
        `
        UPDATE teachers
        SET is_active = true, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND school_id = $2
        RETURNING *
        `,
        [id, schoolId]
    );

    return result.rows[0];
}

module.exports = {

    createTeacher,

    getTeachersBySchool,

    getTeacherById,

    getTeacherByUserId,

    updateTeacher,

    deactivateTeacher,

    reactivateTeacher

};