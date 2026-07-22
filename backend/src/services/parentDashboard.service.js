const db = require("../config/database");

/**
 * Get Parent Dashboard
 */
async function getParentDashboard(studentId) {

    /*
     * Student Information
     */
    const studentResult = await db.query(
        `
        SELECT
            s.id,
            s.first_name,
            s.last_name,
            c.class_name,
            sec.section_name
        FROM students s
        INNER JOIN classes c
            ON s.class_id = c.id
        INNER JOIN sections sec
            ON s.section_id = sec.id
        WHERE s.id = $1
        `,
        [studentId]
    );

    if (studentResult.rows.length === 0) {
        throw new Error("Student not found.");
    }

    /*
     * Attendance Summary
     */
    const attendanceResult = await db.query(
        `
        SELECT
            COUNT(*) FILTER (WHERE status='Present') AS present,
            COUNT(*) FILTER (WHERE status='Absent') AS absent,
            COUNT(*) FILTER (WHERE status='Late') AS late
        FROM attendance
        WHERE student_id=$1
        `,
        [studentId]
    );

    /*
     * Pending Homework
     */
    const homeworkResult = await db.query(
        `
        SELECT COUNT(*) AS pending_homework
        FROM homework h
        INNER JOIN teacher_subjects ts
            ON h.teacher_subject_id = ts.id
        INNER JOIN students s
            ON s.class_id = ts.class_id
        WHERE s.id=$1
          AND h.due_date >= CURRENT_DATE
        `,
        [studentId]
    );

    /*
     * Upcoming Exams
     */
    const examResult = await db.query(
        `
        SELECT COUNT(DISTINCT e.id) AS upcoming_exams
        FROM exams e
        INNER JOIN exam_subjects es
            ON e.id = es.exam_id
        INNER JOIN teacher_subjects ts
            ON es.teacher_subject_id = ts.id
        INNER JOIN students s
            ON s.class_id = ts.class_id
        WHERE s.id=$1
          AND e.start_date >= CURRENT_DATE
        `,
        [studentId]
    );

    /*
     * Latest Exam Result
     */
    const markResult = await db.query(
        `
        SELECT
            ROUND(AVG(percentage),2) AS average_percentage,
            MAX(grade_name) AS grade_name
        FROM student_marks
        WHERE student_id=$1
        `,
        [studentId]
    );

    return {

        student: {

            id: studentResult.rows[0].id,

            name:
                studentResult.rows[0].first_name +
                " " +
                studentResult.rows[0].last_name,

            class:
                studentResult.rows[0].class_name,

            section:
                studentResult.rows[0].section_name

        },

        attendance: {

            present:
                Number(attendanceResult.rows[0].present || 0),

            absent:
                Number(attendanceResult.rows[0].absent || 0),

            late:
                Number(attendanceResult.rows[0].late || 0)

        },

        homework: {

            pending:
                Number(homeworkResult.rows[0].pending_homework)

        },

        exams: {

            upcoming:
                Number(examResult.rows[0].upcoming_exams)

        },

        latestResult: {

            percentage:
                Number(markResult.rows[0].average_percentage || 0),

            grade:
                markResult.rows[0].grade_name || "N/A"

        }

    };

}

module.exports = {

    getParentDashboard

};