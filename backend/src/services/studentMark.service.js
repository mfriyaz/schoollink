const db = require("../config/database");
const studentMarkModel = require("../models/studentMark.model");

/**
 * Create Student Mark
 */
async function createStudentMark(data) {

    // Get maximum marks configured for this exam subject
    const examSubjectResult = await db.query(
        `
        SELECT max_marks
        FROM exam_subjects
        WHERE id = $1
        `,
        [data.exam_subject_id]
    );

    if (examSubjectResult.rows.length === 0) {
        throw new Error("Exam Subject not found.");
    }

    const maxMarks = Number(examSubjectResult.rows[0].max_marks);
    const obtainedMarks = Number(data.marks_obtained);

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
        SELECT max_marks
        FROM exam_subjects
        WHERE id = $1
        `,
        [mark.exam_subject_id]
    );
    
    if (examSubjectResult.rows.length === 0) {
    throw new Error("Exam Subject not found.");
    }

    const maxMarks = Number(examSubjectResult.rows[0].max_marks);
    const obtainedMarks = Number(data.marks_obtained);

    if (obtainedMarks > maxMarks) {
        throw new Error(
            `Marks obtained cannot exceed maximum marks (${maxMarks}).`
        );
    }

    if (obtainedMarks < 0) {
        throw new Error("Marks obtained cannot be negative.");
    }

    return await studentMarkModel.updateStudentMark(id, data);

}

/**
 * Delete Student Mark
 */
async function deleteStudentMark(id) {

    return await studentMarkModel.deleteStudentMark(id);

}

module.exports = {

    createStudentMark,

    getMarksByExamSubject,

    getMarksByStudent,

    getStudentMarkById,

    updateStudentMark,

    deleteStudentMark

};