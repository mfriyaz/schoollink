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

module.exports = {

    getMyChildren

};
