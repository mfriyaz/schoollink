const morningGreetingModel = require("../models/morningGreeting.model");
const notifierService = require("./notifier.service");

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

/**
 * React to a greeting - verifies the teacher actually owns
 * this student's class before allowing the reaction.
 */
async function reactToGreeting(greetingId, teacherUserId, reaction) {

    const owns = await morningGreetingModel.teacherOwnsGreeting(

        greetingId,

        teacherUserId

    );

    if (!owns) {

        throw new Error("This greeting is not for one of your students.");

    }

    const greeting = await morningGreetingModel.reactToGreeting(greetingId, reaction);

    try {

        await notifierService.notifyParentOfGreetingReaction(greeting);

    } catch (err) {

        console.error("Failed to notify parent of greeting reaction:", err);

    }

    return greeting;

}

/**
 * React to multiple greetings at once. Reuses the existing
 * "today's greetings for this class teacher" query as the
 * source of truth for ownership, rather than checking each id
 * one at a time - anything in greetingIds that isn't actually
 * one of this teacher's own students today is silently
 * dropped, not just trusted from the request.
 */
async function bulkReactToGreetings(greetingIds, teacherUserId, reaction) {

    const ownGreetings = await morningGreetingModel.getTodaysGreetingsForClassTeacher(

        teacherUserId

    );

    const ownIds = new Set(ownGreetings.map((g) => g.id));

    const verifiedIds = greetingIds.filter((id) => ownIds.has(id));

    if (verifiedIds.length === 0) {

        return [];

    }

    const greetings = await morningGreetingModel.bulkReactToGreetings(verifiedIds, reaction);

    for (const greeting of greetings) {

        try {

            await notifierService.notifyParentOfGreetingReaction(greeting);

        } catch (err) {

            console.error("Failed to notify parent of greeting reaction:", err);

        }

    }

    return greetings;

}

module.exports = {

    submitGreeting,

    getTodaysGreeting,

    getTodaysGreetingsForClassTeacher,

    parentOwnsStudent,

    reactToGreeting,

    bulkReactToGreetings

};
