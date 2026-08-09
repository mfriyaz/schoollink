const pool = require("../config/database");

async function getStudentCount(schoolId) {

    const result = await pool.query(

        `SELECT COUNT(*) FROM students WHERE is_active = true AND school_id = $1`,

        [schoolId]

    );

    return Number(result.rows[0].count);

}

async function getTeacherCount(schoolId) {

    const result = await pool.query(

        `SELECT COUNT(*) FROM teachers WHERE is_active = true AND school_id = $1`,

        [schoolId]

    );

    return Number(result.rows[0].count);

}

async function getClassCount(schoolId) {

    const result = await pool.query(

        `SELECT COUNT(*) FROM classes WHERE is_active = true AND school_id = $1`,

        [schoolId]

    );

    return Number(result.rows[0].count);

}

async function getRecentStudents(schoolId) {

    const result = await pool.query(`

        SELECT

            id,

            admission_no,

            first_name,

            last_name,

            created_at

        FROM students

        WHERE school_id = $1

        ORDER BY created_at DESC

        LIMIT 5

    `, [schoolId]);

    return result.rows;

}

async function getBirthdays(schoolId) {

    const result = await pool.query(`

        SELECT

            first_name,

            last_name,

            date_of_birth

        FROM students

        WHERE
            school_id = $1

        AND

            EXTRACT(MONTH FROM date_of_birth)=EXTRACT(MONTH FROM CURRENT_DATE)

        AND

            EXTRACT(DAY FROM date_of_birth)=EXTRACT(DAY FROM CURRENT_DATE)

    `, [schoolId]);

    return result.rows;

}

async function getAnnouncements(schoolId) {

    const result = await pool.query(

        `

        SELECT

            id,

            title,

            description,

            target_audience,

            publish_date

        FROM announcements

        WHERE school_id = $1

        AND is_active = true

        ORDER BY publish_date DESC

        LIMIT 5

        `,

        [schoolId]

    );

    return result.rows;

}

/**
 * Count of homework posts created today for this school
 */
async function getPostsTodayCount(schoolId) {

    const result = await pool.query(
        `
        SELECT COUNT(*)
        FROM homework hw
        JOIN teacher_subjects ts
            ON hw.teacher_subject_id = ts.id
        WHERE ts.school_id = $1
        AND hw.homework_date = CURRENT_DATE
        `,
        [schoolId]
    );

    return Number(result.rows[0].count);

}

/**
 * Recent homework posts across the whole school, each with
 * its acknowledged/pending counts - matches the mockup's
 * "Recent Posts" list on the Admin Dashboard.
 */
async function getRecentPosts(schoolId) {

    const result = await pool.query(
        `
        SELECT
            hw.id,
            hw.title,
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
        GROUP BY
            hw.id, c.class_name, sec.section_name,
            s.subject_name, t.first_name, t.last_name
        ORDER BY hw.created_at DESC
        LIMIT 5
        `,
        [schoolId]
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
 * Recent announcements for this school, each with acknowledged/
 * pending counts if the audience is "All" (the only audience
 * that maps to a concrete student list right now).
 */
async function getRecentAnnouncements(schoolId) {

    const result = await pool.query(
        `
        SELECT
            an.id,
            an.title,
            an.target_audience,
            an.created_at
        FROM announcements an
        WHERE an.school_id = $1
        AND an.is_active = true
        ORDER BY an.created_at DESC
        LIMIT 5
        `,
        [schoolId]
    );

    const withCounts = [];

    for (const row of result.rows) {

        if (row.target_audience !== "All") {

            withCounts.push({

                ...row,

                post_type: "announcement",

                total_students: null,

                acknowledged_count: null,

                pending_count: null

            });

            continue;

        }

        const countsResult = await pool.query(
            `
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
            `,
            [row.id, schoolId]
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

/**
 * Pending acknowledgements, broken down by class -
 * powers the donut chart on the mockup's Admin Dashboard.
 */
async function getPendingAcknowledgementsByClass(schoolId) {

    const result = await pool.query(
        `
        SELECT
            c.class_name,
            COUNT(st.id) FILTER (WHERE NOT COALESCE(a.is_acknowledged, false)) AS pending_count
        FROM homework hw
        JOIN teacher_subjects ts
            ON hw.teacher_subject_id = ts.id
        JOIN classes c
            ON ts.class_id = c.id
        JOIN students st
            ON st.class_id = ts.class_id
            AND st.section_id = ts.section_id
            AND st.is_active = true
        LEFT JOIN acknowledgements a
            ON a.post_type = 'homework'
            AND a.post_id = hw.id
            AND a.student_id = st.id
        WHERE ts.school_id = $1
        GROUP BY c.class_name
        HAVING COUNT(st.id) FILTER (WHERE NOT COALESCE(a.is_acknowledged, false)) > 0
        ORDER BY pending_count DESC
        `,
        [schoolId]
    );

    return result.rows.map((row) => ({

        class_name: row.class_name,

        pending_count: Number(row.pending_count)

    }));

}

module.exports = {

    getStudentCount,

    getTeacherCount,

    getClassCount,

    getRecentStudents,

    getBirthdays,

    getAnnouncements,

    getPostsTodayCount,

    getRecentPosts,

    getRecentAnnouncements,

    getPendingAcknowledgementsByClass

};
