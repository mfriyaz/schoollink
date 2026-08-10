const db = require("../config/database");

/**
 * Get My Children
 * (resolves a logged-in Parent's user id -> the student(s)
 * they are linked to via parent_students)
 */
async function getMyChildren(parentUserId) {

    const query = `
        SELECT
            st.id AS student_id,
            st.first_name,
            st.last_name,
            st.admission_no,
            st.class_id,
            st.section_id,
            c.class_name,
            sec.section_name,
            ps.relationship
        FROM parent_students ps
        JOIN students st
            ON ps.student_id = st.id
        JOIN classes c
            ON st.class_id = c.id
        JOIN sections sec
            ON st.section_id = sec.id
        WHERE ps.parent_user_id = $1
        ORDER BY st.first_name;
    `;

    const result = await db.query(query, [parentUserId]);

    return result.rows;

}

/**
 * Find an existing Parent user by email, scoped to a school -
 * used to detect "this parent already has another child here"
 * rather than creating a duplicate account.
 */
async function findParentByEmail(email, schoolId) {

    const result = await db.query(
        `
        SELECT u.id, u.full_name, u.email, u.mobile
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.email = $1
        AND u.school_id = $2
        AND r.role_name = 'Parent'
        `,
        [email, schoolId]
    );

    return result.rows[0];

}

/**
 * Check whether a parent is already linked to a given student -
 * avoids creating a duplicate parent_students row.
 */
async function isLinked(parentUserId, studentId) {

    const result = await db.query(
        `
        SELECT 1 FROM parent_students
        WHERE parent_user_id = $1 AND student_id = $2
        `,
        [parentUserId, studentId]
    );

    return result.rows.length > 0;

}

/**
 * Link a parent (new or existing) to a student.
 */
async function linkParentToStudent(parentUserId, studentId, relationship) {

    const result = await db.query(
        `
        INSERT INTO parent_students (parent_user_id, student_id, relationship)
        VALUES ($1, $2, $3)
        RETURNING *;
        `,
        [parentUserId, studentId, relationship || null]
    );

    return result.rows[0];

}

/**
 * Get every parent linked to a given student - for the School
 * Admin's "who's linked to this student" view.
 */
async function getParentsForStudent(studentId) {

    const result = await db.query(
        `
        SELECT
            u.id AS parent_user_id,
            u.full_name,
            u.email,
            u.mobile,
            ps.relationship,
            ps.created_at AS linked_at
        FROM parent_students ps
        JOIN users u ON ps.parent_user_id = u.id
        WHERE ps.student_id = $1
        ORDER BY ps.created_at
        `,
        [studentId]
    );

    return result.rows;

}

module.exports = {

    getMyChildren,

    findParentByEmail,

    isLinked,

    linkParentToStudent,

    getParentsForStudent

};
