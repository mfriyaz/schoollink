const pool = require("../config/database");

/**
 * All homework posts for a school, optionally filtered by a
 * title search. Same ack-count shape as the dashboard's
 * "recent posts" preview, just without the LIMIT 5.
 */
async function getAllHomeworkPosts(schoolId, search) {

    const result = await pool.query(
        `
        SELECT
            hw.id,
            hw.title,
            hw.description,
            hw.created_at,
            c.class_name,
            sec.section_name,
            s.subject_name,
            t.first_name AS teacher_first_name,
            t.last_name AS teacher_last_name,
            COUNT(st.id) AS total_students,
            COUNT(st.id) FILTER (WHERE a.is_acknowledged) AS acknowledged_count
        FROM homework hw
        JOIN teacher_subjects ts
            ON hw.teacher_subject_id = ts.id
        JOIN classes c
            ON ts.class_id = c.id
        JOIN sections sec
            ON ts.section_id = sec.id
        JOIN subjects s
            ON ts.subject_id = s.id
        JOIN teachers t
            ON ts.teacher_id = t.id
        JOIN students st
            ON st.class_id = ts.class_id
            AND st.section_id = ts.section_id
            AND st.is_active = true
        LEFT JOIN acknowledgements a
            ON a.post_type = 'homework'
            AND a.post_id = hw.id
            AND a.student_id = st.id
        WHERE ts.school_id = $1
        AND ($2::text IS NULL OR hw.title ILIKE '%' || $2 || '%')
        GROUP BY
            hw.id, c.class_name, sec.section_name,
            s.subject_name, t.first_name, t.last_name
        ORDER BY hw.created_at DESC
        `,
        [schoolId, search || null]
    );

    return result.rows.map((row) => ({

        ...row,

        post_type: "homework",

        total_students: Number(row.total_students),

        acknowledged_count: Number(row.acknowledged_count),

        pending_count: Number(row.total_students) - Number(row.acknowledged_count)

    }));

}

/**
 * All announcements for a school, optionally filtered by a
 * title search.
 */
async function getAllAnnouncementPosts(schoolId, search) {

    const result = await pool.query(
        `
        SELECT
            an.id,
            an.title,
            an.description,
            an.target_audience,
            an.created_at
        FROM announcements an
        WHERE an.school_id = $1
        AND an.is_active = true
        AND ($2::text IS NULL OR an.title ILIKE '%' || $2 || '%')
        ORDER BY an.created_at DESC
        `,
        [schoolId, search || null]
    );

    const withCounts = [];

    for (const row of result.rows) {

        const classLinksResult = await pool.query(
            `SELECT class_id FROM announcement_classes WHERE announcement_id = $1`,
            [row.id]
        );

        const linkedClassIds = classLinksResult.rows.map((r) => r.class_id);

        if (linkedClassIds.length === 0 && row.target_audience !== "All") {

            withCounts.push({

                ...row,

                post_type: "announcement",

                total_students: null,

                acknowledged_count: null,

                pending_count: null

            });

            continue;

        }

        const countsQuery = linkedClassIds.length > 0
            ? `
                SELECT
                    COUNT(st.id) AS total_students,
                    COUNT(st.id) FILTER (WHERE a.is_acknowledged) AS acknowledged_count
                FROM students st
                LEFT JOIN acknowledgements a
                    ON a.post_type = 'announcement'
                    AND a.post_id = $1
                    AND a.student_id = st.id
                WHERE st.class_id = ANY($2::int[])
                AND st.is_active = true
            `
            : `
                SELECT
                    COUNT(st.id) AS total_students,
                    COUNT(st.id) FILTER (WHERE a.is_acknowledged) AS acknowledged_count
                FROM students st
                LEFT JOIN acknowledgements a
                    ON a.post_type = 'announcement'
                    AND a.post_id = $1
                    AND a.student_id = st.id
                WHERE st.school_id = $2
                AND st.is_active = true
            `;

        const countsParam = linkedClassIds.length > 0 ? linkedClassIds : schoolId;

        const countsResult = await pool.query(
            countsQuery,
            [row.id, countsParam]
        );

        const total = Number(countsResult.rows[0].total_students);

        const acknowledged = Number(countsResult.rows[0].acknowledged_count);

        withCounts.push({

            ...row,

            post_type: "announcement",

            total_students: total,

            acknowledged_count: acknowledged,

            pending_count: total - acknowledged

        });

    }

    return withCounts;

}

module.exports = {

    getAllHomeworkPosts,

    getAllAnnouncementPosts

};
