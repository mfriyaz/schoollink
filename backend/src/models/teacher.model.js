const db = require("../config/database");

/**
 * Create Teacher
 */
async function createTeacher(data) {

    const query = `
        INSERT INTO teachers
        (
            school_id,
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
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
        )
        RETURNING *;
    `;

    const values = [
        data.school_id,
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
async function getTeacherById(id) {

    const result = await db.query(
        "SELECT * FROM teachers WHERE id = $1",
        [id]
    );

    return result.rows[0];
}

/**
 * Update Teacher
 */
async function updateTeacher(id, data) {

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
        id
    ];

    const result = await db.query(query, values);

    return result.rows[0];
}

/**
 * Delete Teacher
 */
async function deleteTeacher(id) {

    const result = await db.query(
        "DELETE FROM teachers WHERE id = $1 RETURNING *",
        [id]
    );

    return result.rows[0];
}

module.exports = {

    createTeacher,

    getTeachersBySchool,

    getTeacherById,

    updateTeacher,

    deleteTeacher

};