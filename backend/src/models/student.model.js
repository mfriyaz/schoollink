const pool = require("../config/database");

/**
 * Create Student
 */
async function createStudent(student) {

    const query = `
        INSERT INTO students
        (
            school_id,
            academic_year_id,
            class_id,
            section_id,
            admission_no,
            first_name,
            last_name,
            gender,
            date_of_birth,
            father_name,
            mother_name,
            parent_phone,
            parent_email,
            address
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14
        )
        RETURNING *;
    `;

    const values = [

        student.school_id,
        student.academic_year_id,
        student.class_id,
        student.section_id,
        student.admission_no,
        student.first_name,
        student.last_name || null,
        student.gender || null,
        student.date_of_birth || null,
        student.father_name || null,
        student.mother_name || null,
        student.parent_phone || null,
        student.parent_email || null,
        student.address || null

    ];

    const result = await pool.query(query, values);

    return result.rows[0];

}

/**
 * Get All Students
 */
async function getAllStudents() {

    const result = await pool.query(`
        SELECT *
        FROM students
        ORDER BY first_name;
    `);

    return result.rows;

}

/**
 * Get Student By ID
 */
async function getStudentById(id) {

    const result = await pool.query(

        `
        SELECT *
        FROM students
        WHERE id=$1
        `,

        [id]

    );

    return result.rows[0];

}

/**
 * Get Students By Class
 */
async function getStudentsByClass(classId) {

    const result = await pool.query(

        `
        SELECT *
        FROM students
        WHERE class_id=$1
        ORDER BY first_name
        `,

        [classId]

    );

    return result.rows;

}

/**
 * Get Students By Section
 */
async function getStudentsBySection(sectionId) {

    const result = await pool.query(

        `
        SELECT *
        FROM students
        WHERE section_id=$1
        ORDER BY first_name
        `,

        [sectionId]

    );

    return result.rows;

}

/**
 * Update Student
 */
async function updateStudent(id, student) {

    const query = `

        UPDATE students

        SET

            first_name=$1,

            last_name=$2,

            gender=$3,

            date_of_birth=$4,

            father_name=$5,

            mother_name=$6,

            parent_phone=$7,

            parent_email=$8,

            address=$9,

            is_active=$10,

            updated_at=NOW()

        WHERE id=$11

        RETURNING *;

    `;

    const values = [

        student.first_name,
        student.last_name,
        student.gender,
        student.date_of_birth,
        student.father_name,
        student.mother_name,
        student.parent_phone,
        student.parent_email,
        student.address,
        student.is_active,
        id

    ];

    const result = await pool.query(query, values);

    return result.rows[0];

}

/**
 * Delete Student
 */
async function deleteStudent(id) {

    const result = await pool.query(

        `
        DELETE FROM students
        WHERE id=$1
        RETURNING *;
        `,

        [id]

    );

    return result.rows[0];

}

module.exports = {

    createStudent,

    getAllStudents,

    getStudentById,

    getStudentsByClass,

    getStudentsBySection,

    updateStudent,

    deleteStudent

};