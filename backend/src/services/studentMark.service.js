const db = require("../config/database");
const studentMarkModel = require("../models/studentMark.model");
const gradeCalculator = require("./gradeCalculator.service");

/**
 * Create Student Mark
 */
async function createStudentMark(data) {

    // Get maximum marks configured for this exam subject
    const examSubjectResult = await db.query(
        `
        SELECT
            es.max_marks,
            e.school_id
        FROM exam_subjects es
        INNER JOIN exams e
            ON es.exam_id = e.id
        WHERE es.id = $1
        `,
        [data.exam_subject_id]
    );

    if (examSubjectResult.rows.length === 0) {
        throw new Error("Exam Subject not found.");
    }

    const maxMarks = Number(examSubjectResult.rows[0].max_marks);
    const schoolId = examSubjectResult.rows[0].school_id;
    const obtainedMarks = Number(data.marks_obtained);

    // Validate marks
    if (obtainedMarks > maxMarks) {
        throw new Error(
            `Marks obtained cannot exceed maximum marks (${maxMarks}).`
        );
    }

    if (obtainedMarks < 0) {
        throw new Error("Marks obtained cannot be negative.");
    }

    // Check duplicate marks
    const duplicateResult = await db.query(
        `
        SELECT id
        FROM student_marks
        WHERE exam_subject_id = $1
          AND student_id = $2
        `,
        [
            data.exam_subject_id,
            data.student_id
        ]
    );

    if (duplicateResult.rows.length > 0) {
        throw new Error(
            "Marks for this student have already been entered for this exam subject."
        );
    }

    // Calculate grade automatically
    const grade = await gradeCalculator.calculateGrade(
        schoolId,
        obtainedMarks,
        maxMarks
    );

    data.percentage = grade.percentage;
    data.grade_name = grade.grade_name;
    data.grade_point = grade.grade_point;
    data.result = grade.result;

    return await studentMarkModel.createStudentMark(data);

}

/**
 * Get Marks By Exam Subject
 */
async function getMarksByExamSubject(examSubjectId) {

    return await studentMarkModel.getMarksByExamSubject(examSubjectId);

}

/**
 * Get Marks By Student
 */
async function getMarksByStudent(studentId) {

    return await studentMarkModel.getMarksByStudent(studentId);

}

/**
 * Get Student Mark By ID
 */
async function getStudentMarkById(id) {

    return await studentMarkModel.getStudentMarkById(id);

}

/**
 * Update Student Mark
 */
async function updateStudentMark(id, data) {

    const mark = await studentMarkModel.getStudentMarkById(id);

    if (!mark) {
        throw new Error("Student mark not found.");
    }

    const examSubjectResult = await db.query(
        `
        SELECT
            es.max_marks,
            e.school_id
        FROM exam_subjects es
        INNER JOIN exams e
            ON es.exam_id = e.id
        WHERE es.id = $1
        `,
        [mark.exam_subject_id]
    );

    if (examSubjectResult.rows.length === 0) {
        throw new Error("Exam Subject not found.");
    }

    const maxMarks = Number(examSubjectResult.rows[0].max_marks);
    const schoolId = examSubjectResult.rows[0].school_id;
    const obtainedMarks = Number(data.marks_obtained);

    // Validate marks
    if (obtainedMarks > maxMarks) {
        throw new Error(
            `Marks obtained cannot exceed maximum marks (${maxMarks}).`
        );
    }

    if (obtainedMarks < 0) {
        throw new Error("Marks obtained cannot be negative.");
    }

    // Calculate grade automatically
    const grade = await gradeCalculator.calculateGrade(
        schoolId,
        obtainedMarks,
        maxMarks
    );

    data.percentage = grade.percentage;
    data.grade_name = grade.grade_name;
    data.grade_point = grade.grade_point;
    data.result = grade.result;

    return await studentMarkModel.updateStudentMark(id, data);

}

/**
 * Delete Student Mark
 */
async function deleteStudentMark(id) {

    return await studentMarkModel.deleteStudentMark(id);

}

/**
 * Get Roster With Marks
 */
async function getRosterWithMarks(examSubjectId) {

    return await studentMarkModel.getRosterWithMarks(examSubjectId);

}

/**
 * Bulk Mark An Exam Subject For A Whole Class
 */
async function bulkMarkExam(examSubjectId, records) {

    const examSubjectResult = await db.query(
        `
        SELECT
            es.max_marks,
            e.school_id
        FROM exam_subjects es
        INNER JOIN exams e
            ON es.exam_id = e.id
        WHERE es.id = $1
        `,
        [examSubjectId]
    );

    if (examSubjectResult.rows.length === 0) {
        throw new Error("Exam Subject not found.");
    }

    const maxMarks = Number(examSubjectResult.rows[0].max_marks);
    const schoolId = examSubjectResult.rows[0].school_id;

    const enrichedRecords = [];

    for (const record of records) {

        const obtainedMarks = Number(record.marks_obtained);

        if (obtainedMarks > maxMarks) {
            throw new Error(
                `Marks obtained cannot exceed maximum marks (${maxMarks}).`
            );
        }

        if (obtainedMarks < 0) {
            throw new Error("Marks obtained cannot be negative.");
        }

        const grade = await gradeCalculator.calculateGrade(
            schoolId,
            obtainedMarks,
            maxMarks
        );

        enrichedRecords.push({

            student_id: record.student_id,

            marks_obtained: obtainedMarks,

            percentage: grade.percentage,

            grade_name: grade.grade_name,

            grade_point: grade.grade_point,

            result: grade.result

        });

    }

    return await studentMarkModel.bulkUpsertStudentMarks(
        examSubjectId,
        enrichedRecords
    );

}

/**
 * Verify a teacher (by their users.id) owns the class/subject
 * behind the given exam_subject_id.
 */
async function teacherOwnsExamSubject(userId, examSubjectId) {

    const result = await db.query(
        `
        SELECT es.id
        FROM exam_subjects es
        JOIN teacher_subjects ts ON es.teacher_subject_id = ts.id
        JOIN teachers t ON ts.teacher_id = t.id
        WHERE t.user_id = $1
        AND es.id = $2
        `,
        [userId, examSubjectId]
    );

    return result.rows.length > 0;

}

/**
 * Verify a parent (by their users.id) is actually linked to
 * the given student.
 */
async function parentOwnsStudent(userId, studentId) {

    const result = await db.query(
        `
        SELECT 1
        FROM parent_students
        WHERE parent_user_id = $1
        AND student_id = $2
        `,
        [userId, studentId]
    );

    return result.rows.length > 0;

}

module.exports = {

    createStudentMark,

    getMarksByExamSubject,

    getMarksByStudent,

    getStudentMarkById,

    updateStudentMark,

    deleteStudentMark,

    getRosterWithMarks,

    bulkMarkExam,

    teacherOwnsExamSubject,

    parentOwnsStudent

};