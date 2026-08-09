const db = require("../config/database");

/**
 * Assign Teacher to Subject
 */
async function createAssignment(data) {

    const query = `
        INSERT INTO teacher_subjects
        (
            school_id,
            academic_year_id,
            teacher_id,
            subject_id,
            class_id,
            section_id,
            is_class_teacher
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6,$7
        )
        RETURNING *;
    `;

    const values = [

        data.school_id,
        data.academic_year_id,
        data.teacher_id,
        data.subject_id,
        data.class_id,
        data.section_id,
        data.is_class_teacher || false

    ];

    const result = await db.query(query, values);

    return result.rows[0];

}

/**
 * Get Assignments By School
 */
async function getAssignmentsBySchool(schoolId) {

    const query = `
        SELECT
            ts.*,
            t.first_name,
            t.last_name,
            s.subject_name,
            c.class_name,
            sec.section_name,
            ay.year_name
        FROM teacher_subjects ts
        JOIN teachers t
            ON ts.teacher_id = t.id
        JOIN subjects s
            ON ts.subject_id = s.id
        JOIN classes c
            ON ts.class_id = c.id
        JOIN sections sec
            ON ts.section_id = sec.id
        JOIN academic_years ay
            ON ts.academic_year_id = ay.id
        WHERE ts.school_id = $1
        ORDER BY
            c.class_name,
            sec.section_name,
            s.subject_name;
    `;

    const result = await db.query(query, [schoolId]);

    return result.rows;

}

/**
 * Get Assignments By Teacher
 * (used to populate the Class/Subject dropdowns on the
 * Teacher's Create Post screen)
 */
async function getAssignmentsByTeacher(teacherId) {

    const query = `
        SELECT
            ts.id AS teacher_subject_id,
            ts.class_id,
            ts.section_id,
            ts.subject_id,
            s.subject_name,
            c.class_name,
            sec.section_name
        FROM teacher_subjects ts
        JOIN subjects s
            ON ts.subject_id = s.id
        JOIN classes c
            ON ts.class_id = c.id
        JOIN sections sec
            ON ts.section_id = sec.id
        WHERE ts.teacher_id = $1
        ORDER BY
            c.class_name,
            sec.section_name,
            s.subject_name;
    `;

    const result = await db.query(query, [teacherId]);

    return result.rows;

}

/**
 * Get Assignment By ID
 */
async function getAssignmentById(id) {

    const result = await db.query(
        `
        SELECT *
        FROM teacher_subjects
        WHERE id=$1
        `,
        [id]
    );

    return result.rows[0];

}

/**
 * Delete Assignment
 */
async function deleteAssignment(id) {

    const result = await db.query(
        `
        DELETE FROM teacher_subjects
        WHERE id=$1
        RETURNING *;
        `,
        [id]
    );

    return result.rows[0];

}

module.exports = {

    createAssignment,

    getAssignmentsBySchool,

    getAssignmentsByTeacher,

    getAssignmentById,

    deleteAssignment

};