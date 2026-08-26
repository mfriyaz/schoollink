const db = require("../config/database");

const notificationModel = require("../models/notification.model");
const emailService = require("./email.service");

/**
 * Create a notification for a user, but only if they haven't
 * turned in-app notifications off. Users who've never visited
 * Settings have no user_settings row yet - treated as "on" by
 * default (COALESCE), matching the column's own default.
 *
 * inAppMessage and emailBody are separate on purpose: the
 * in-app one renders as plain text in the notification bell,
 * so it must stay plain text; the email one is inserted as
 * HTML, so it can use <strong>/<br> for a richer layout.
 */
async function notifyIfEnabled(userId, title, inAppMessage, emailBody, link) {

    const prefResult = await db.query(
        `
        SELECT
            COALESCE(s.in_app_notifications, true) AS in_app_enabled,
            COALESCE(s.email_notifications, true) AS email_enabled,
            u.email
        FROM users u
        LEFT JOIN user_settings s ON s.user_id = u.id
        WHERE u.id = $1
        `,
        [userId]
    );

    const prefs = prefResult.rows[0];

    if (!prefs) {

        return;

    }

    if (prefs.email_enabled) {

        await emailService.sendEmail(prefs.email, title, emailBody);

    }

    if (!prefs.in_app_enabled) {

        return;

    }

    await notificationModel.createNotification({

        user_id: userId,

        title,

        message: inAppMessage,

        link

    });

}

/**
 * Notify every parent linked to a student in the homework's
 * class/section that a new homework post was published.
 */
async function notifyParentsOfHomework(homeworkId) {

    const result = await db.query(
        `
        SELECT DISTINCT
            ps.parent_user_id,
            st.id AS student_id,
            st.first_name AS student_first_name,
            hw.title,
            hw.description,
            hw.due_date,
            s.subject_name,
            t.first_name AS teacher_first_name,
            t.last_name AS teacher_last_name
        FROM homework hw
        JOIN teacher_subjects ts
            ON hw.teacher_subject_id = ts.id
        JOIN subjects s
            ON ts.subject_id = s.id
        JOIN teachers t
            ON ts.teacher_id = t.id
        JOIN students st
            ON st.class_id = ts.class_id
            AND st.section_id = ts.section_id
            AND st.is_active = true
        JOIN parent_students ps
            ON ps.student_id = st.id
        WHERE hw.id = $1
        `,
        [homeworkId]
    );

    for (const row of result.rows) {

        const dueDateLabel = row.due_date
            ? new Date(row.due_date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric"
            })
            : "Not specified";

        const inAppMessage = `${row.title} (${row.subject_name})`;

        const emailBody =
            `<strong>${row.title}</strong> (${row.subject_name})<br>` +
            `For: ${row.student_first_name}<br>` +
            `Teacher: ${row.teacher_first_name} ${row.teacher_last_name}<br>` +
            `Due: ${dueDateLabel}<br><br>` +
            (row.description ? `${row.description}<br><br>` : "") +
            `Please log in to SchoolLink to view and acknowledge this post.`;

        await notifyIfEnabled(
            row.parent_user_id,
            "New Homework Posted",
            inAppMessage,
            emailBody,
            `/parent/post/homework/${homeworkId}/${row.student_id}`
        );

    }

}

/**
 * Notify parents affected by a new announcement - either
 * everyone in the school ("All" audience) or just the parents
 * of students in the linked specific classes.
 */
async function notifyParentsOfAnnouncement(announcementId) {

    const announcementResult = await db.query(
        `SELECT * FROM announcements WHERE id = $1`,
        [announcementId]
    );

    const announcement = announcementResult.rows[0];

    if (!announcement) {

        return;

    }

    const classLinksResult = await db.query(
        `SELECT class_id FROM announcement_classes WHERE announcement_id = $1`,
        [announcementId]
    );

    const linkedClassIds = classLinksResult.rows.map((r) => r.class_id);

    let parentRows;

    if (linkedClassIds.length > 0) {

        parentRows = await db.query(
            `
            SELECT DISTINCT ps.parent_user_id, st.id AS student_id
            FROM students st
            JOIN parent_students ps ON ps.student_id = st.id
            WHERE st.class_id = ANY($1::int[])
            AND st.is_active = true
            `,
            [linkedClassIds]
        );

    } else if (announcement.target_audience === "All") {

        parentRows = await db.query(
            `
            SELECT DISTINCT ps.parent_user_id, st.id AS student_id
            FROM students st
            JOIN parent_students ps ON ps.student_id = st.id
            WHERE st.school_id = $1
            AND st.is_active = true
            `,
            [announcement.school_id]
        );

    } else {

        // Broad non-"All" audiences (Teachers, School Admin, etc.)
        // aren't mapped to a parent list - nothing to notify here.
        return;

    }

    for (const row of parentRows.rows) {

        const emailBody =
            `<strong>${announcement.title}</strong><br>` +
            `Audience: ${announcement.target_audience}<br><br>` +
            (announcement.description ? `${announcement.description}<br><br>` : "") +
            `Please log in to SchoolLink to view this announcement.`;

        await notifyIfEnabled(
            row.parent_user_id,
            "New Announcement",
            announcement.title,
            emailBody,
            `/parent/post/announcement/${announcementId}/${row.student_id}`
        );

    }

}

/**
 * Notify the post's "owner" (the teacher for homework, or the
 * school's admins for an announcement) that a parent
 * acknowledged it.
 */
async function notifyOwnerOfAcknowledgement(postType, postId, studentId) {

    const studentResult = await db.query(
        `SELECT first_name, last_name FROM students WHERE id = $1`,
        [studentId]
    );

    const student = studentResult.rows[0];

    const studentName = student
        ? `${student.first_name} ${student.last_name}`
        : "A parent";

    if (postType === "homework") {

        const ownerResult = await db.query(
            `
            SELECT t.user_id, hw.title
            FROM homework hw
            JOIN teacher_subjects ts ON hw.teacher_subject_id = ts.id
            JOIN teachers t ON ts.teacher_id = t.id
            WHERE hw.id = $1
            AND t.user_id IS NOT NULL
            `,
            [postId]
        );

        const owner = ownerResult.rows[0];

        if (owner) {

            await notifyIfEnabled(
                owner.user_id,
                "Homework Acknowledged",
                `${studentName}'s parent acknowledged "${owner.title}"`,
                `${studentName}'s parent acknowledged "${owner.title}"`,
                `/teacher/dashboard`
            );

        }

    } else {

        const announcementResult = await db.query(
            `SELECT school_id, title FROM announcements WHERE id = $1`,
            [postId]
        );

        const announcement = announcementResult.rows[0];

        if (!announcement) {

            return;

        }

        const adminsResult = await db.query(
            `
            SELECT u.id
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.school_id = $1
            AND r.role_name IN ('School Admin', 'Super Admin')
            `,
            [announcement.school_id]
        );

        for (const admin of adminsResult.rows) {

            await notifyIfEnabled(
                admin.id,
                "Announcement Acknowledged",
                `${studentName}'s parent acknowledged "${announcement.title}"`,
                `${studentName}'s parent acknowledged "${announcement.title}"`,
                `/dashboard`
            );

        }

    }

}

const REACTION_LABELS = {

    thumbs_up: "👍",

    heart: "❤️",

    star: "🌟"

};

/**
 * Notify a parent that their child's homework submission has
 * been reviewed by the teacher.
 */
async function notifyParentOfReview(submission) {

    const reactionEmoji = REACTION_LABELS[submission.reaction] || "";

    const message =
        `Your submission for "${submission.homework_title}" was reviewed ${reactionEmoji}`;

    await notifyIfEnabled(
        submission.parent_user_id,
        "Homework Reviewed",
        message,
        message,
        `/parent/post/homework/${submission.homework_id}/${submission.student_id}`
    );

}

const GREETING_REACTION_LABELS = {

    good: "👍 Good",

    nice: "⭐ Nice",

    great: "🎉 Great",

    good_job: "💯 Good Job"

};

/**
 * Notify a parent that the teacher reacted to their Good
 * Morning voice message - the whole point of reacting is for
 * the parent (and student) to actually see it, not just have
 * it sit in the database.
 */
async function notifyParentOfGreetingReaction(greeting) {

    const reactionLabel = GREETING_REACTION_LABELS[greeting.teacher_reaction] || "reacted";

    const message =
        `Your teacher ${reactionLabel} to ${greeting.student_first_name}'s Good Morning message!`;

    await notifyIfEnabled(
        greeting.parent_user_id,
        "Good Morning Message Reaction",
        message,
        message,
        `/parent/dashboard`
    );

}

module.exports = {

    notifyParentsOfHomework,

    notifyParentsOfAnnouncement,

    notifyOwnerOfAcknowledgement,

    notifyParentOfReview,

    notifyParentOfGreetingReaction

};
