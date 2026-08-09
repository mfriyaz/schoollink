const morningGreetingModel = require("../models/morningGreeting.model");

const db = require("../config/database");

async function submitGreeting(studentId, parentUserId, voiceUrl) {

    return await morningGreetingModel.submitGreeting(studentId, parentUserId, voiceUrl);

}

async function getTodaysGreeting(studentId) {

    return await morningGreetingModel.getTodaysGreeting(studentId);

}

async function getTodaysGreetingsForClassTeacher(teacherUserId) {

    return await morningGreetingModel.getTodaysGreetingsForClassTeacher(teacherUserId);

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

    submitGreeting,

    getTodaysGreeting,

    getTodaysGreetingsForClassTeacher,

    parentOwnsStudent

};
