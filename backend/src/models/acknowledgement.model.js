const db = require("../config/database");

/**
 * Get Acknowledgement Summary for a Homework post.
 *
 * Returns one row per student in the class/section the homework
 * was posted to, with whether that student's parent has
 * acknowledged it yet. This matches the "20/28 Acknowledged,
 * 2 Pending" counts shown on the Teacher Dashboard mockup.
 */
async function getHomeworkAckSummary(homeworkId) {

    const query = `
        SELECT
            st.id AS student_id,
            st.first_name,
            st.last_name,
            st.admission_no,
            COALESCE(a.is_acknowledged, false) AS is_acknowledged,
            a.acknowledged_at
        FROM homework hw
        JOIN teacher_subjects ts
            ON hw.teacher_subject_id = ts.id
        JOIN students st
            ON st.class_id = ts.class_id
            AND st.section_id = ts.section_id
            AND st.is_active = true
        LEFT JOIN acknowledgements a
            ON a.post_type = 'homework'
            AND a.post_id = hw.id
            AND a.student_id = st.id
        WHERE hw.id = $1
        ORDER BY st.first_name;
    `;

    const result = await db.query(query, [homeworkId]);

    return result.rows;

}

/**
 * Record (or update) a parent's acknowledgement of a post.
 * Upserts so a parent re-submitting doesn't create duplicates.
 */
async function upsertAcknowledgement(data) {

    const query = `
        INSERT INTO acknowledgements
        (
            post_type,
            post_id,
            student_id,
            parent_user_id,
            is_acknowledged,
            acknowledged_at,
            remarks
        )
        VALUES
        (
            $1,$2,$3,$4,true,NOW(),$5
        )
        ON CONFLICT (post_type, post_id, student_id)
        DO UPDATE SET
            is_acknowledged = true,
            acknowledged_at = NOW(),
            parent_user_id = EXCLUDED.parent_user_id,
            remarks = EXCLUDED.remarks
        RETURNING *;
    `;

    const values = [
        data.post_type,
        data.post_id,
        data.student_id,
        data.parent_user_id,
        data.remarks || null
    ];

    const result = await db.query(query, values);

    return result.rows[0];

}

/**
 * Get Acknowledgement Summary for an Announcement.
 *
 * Only announcements targeting "All" get full tracking against
 * every active student in the school - other audiences
 * (Teachers, School Admin, etc.) aren't mapped to a student
 * list, so summary is not meaningful for them yet.
 */
async function getAnnouncementAckSummary(announcementId) {

    const announcementResult = await db.query(
        `SELECT * FROM announcements WHERE id = $1`,
        [announcementId]
    );

    const announcement = announcementResult.rows[0];

    if (!announcement) {

        return null;

    }

    const classLinksResult = await db.query(
        `SELECT class_id FROM announcement_classes WHERE announcement_id = $1`,
        [announcementId]
    );

    const linkedClassIds = classLinksResult.rows.map((r) => r.class_id);

    if (linkedClassIds.length === 0 && announcement.target_audience !== "All") {

        return {

            supported: false,

            target_audience: announcement.target_audience

        };

    }

    const query = linkedClassIds.length > 0
        ? `
            SELECT
                st.id AS student_id,
                st.first_name,
                st.last_name,
                st.admission_no,
                COALESCE(a.is_acknowledged, false) AS is_acknowledged,
                a.acknowledged_at
            FROM students st
            LEFT JOIN acknowledgements a
                ON a.post_type = 'announcement'
                AND a.post_id = $1
                AND a.student_id = st.id
            WHERE st.class_id = ANY($2::int[])
            AND st.is_active = true
            ORDER BY st.first_name;
        `
        : `
            SELECT
                st.id AS student_id,
                st.first_name,
                st.last_name,
                st.admission_no,
                COALESCE(a.is_acknowledged, false) AS is_acknowledged,
                a.acknowledged_at
            FROM students st
            LEFT JOIN acknowledgements a
                ON a.post_type = 'announcement'
                AND a.post_id = $1
                AND a.student_id = st.id
            WHERE st.school_id = $2
            AND st.is_active = true
            ORDER BY st.first_name;
        `;

    const queryParam = linkedClassIds.length > 0
        ? linkedClassIds
        : announcement.school_id;

    const result = await db.query(
        query,
        [announcementId, queryParam]
    );

    return {

        supported: true,

        rows: result.rows

    };

}

/**
 * Get Announcements For Student
 * (Parent's feed for announcements - only "All"/"Students"/
 * "Parents" audiences are shown, matching the school-wide
 * broadcast nature of announcements)
 */
async function getAnnouncementsForStudent(studentId) {

    const query = `
        SELECT
            an.*,
            COALESCE(a.is_acknowledged, false) AS is_acknowledged,
            a.acknowledged_at,
            a.remarks
        FROM students st
        JOIN announcements an
            ON an.school_id = st.school_id
            AND an.is_active = true
            AND (
                an.target_audience IN ('All', 'Students', 'Parents')
                OR EXISTS (
                    SELECT 1 FROM announcement_classes ac
                    WHERE ac.announcement_id = an.id
                    AND ac.class_id = st.class_id
                )
            )
        LEFT JOIN acknowledgements a
            ON a.post_type = 'announcement'
            AND a.post_id = an.id
            AND a.student_id = st.id
        WHERE st.id = $1
        ORDER BY an.publish_date DESC;
    `;

    const result = await db.query(query, [studentId]);

    return result.rows;

}

module.exports = {

    getHomeworkAckSummary,

    getAnnouncementAckSummary,

    getAnnouncementsForStudent,

    upsertAcknowledgement

};
