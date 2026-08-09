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
 * Get All Students (Supports Search) - scoped to one school,
 * joined with class/section names for display
 */
async function getAllStudents(schoolId, search = "") {

    const keyword = `%${search}%`;

    const result = await pool.query(

        `
        SELECT
            st.*,
            c.class_name,
            sec.section_name
        FROM students st
        LEFT JOIN classes c ON st.class_id = c.id
        LEFT JOIN sections sec ON st.section_id = sec.id
        WHERE
            st.school_id = $2
            AND (
                st.first_name ILIKE $1
                OR st.last_name ILIKE $1
                OR st.admission_no ILIKE $1
                OR st.father_name ILIKE $1
                OR st.parent_phone ILIKE $1
            )
        ORDER BY st.first_name
        `,

        [keyword, schoolId]

    );

    return result.rows;

}

/**
 * Get Student By ID - scoped to one school
 */
async function getStudentById(id, schoolId) {

    const result = await pool.query(

        `
        SELECT *
        FROM students
        WHERE id = $1 AND school_id = $2
        `,

        [id, schoolId]

    );

    return result.rows[0];

}

/**
 * Get Students By Class - scoped to one school
 */
async function getStudentsByClass(classId, schoolId) {

    const result = await pool.query(

        `
        SELECT *
        FROM students
        WHERE class_id = $1 AND school_id = $2
        ORDER BY first_name
        `,

        [classId, schoolId]

    );

    return result.rows;

}

/**
 * Get Students By Section - scoped to one school
 */
async function getStudentsBySection(sectionId, schoolId) {

    const result = await pool.query(

        `
        SELECT *
        FROM students
        WHERE section_id = $1 AND school_id = $2
        ORDER BY first_name
        `,

        [sectionId, schoolId]

    );

    return result.rows;

}

/**
 * Update Student - scoped to one school
 */
async function updateStudent(id, schoolId, student) {

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
            updated_at=NOW()

        WHERE id=$10 AND school_id=$11

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
        id,
        schoolId

    ];

    const result = await pool.query(query, values);

    return result.rows[0];

}

/**
 * Deactivate Student (soft delete)
 * - a student with attendance/marks/acknowledgements tied to
 * them can't be safely erased without either orphaning that
 * history or crashing on a foreign key constraint
 */
async function deactivateStudent(id, schoolId) {

    const result = await pool.query(

        `
        UPDATE students
        SET is_active = false, updated_at = NOW()
        WHERE id = $1 AND school_id = $2
        RETURNING *;
        `,

        [id, schoolId]

    );

    return result.rows[0];

}

/**
 * Reactivate Student
 */
async function reactivateStudent(id, schoolId) {

    const result = await pool.query(

        `
        UPDATE students
        SET is_active = true, updated_at = NOW()
        WHERE id = $1 AND school_id = $2
        RETURNING *;
        `,

        [id, schoolId]

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
    deactivateStudent,
    reactivateStudent

};
