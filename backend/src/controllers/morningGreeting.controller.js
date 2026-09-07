const morningGreetingService = require("../services/morningGreeting.service");
const response = require("../utils/response");

/**
 * Submit (or replace) today's Good Morning greeting
 */
async function submitGreeting(req, res) {

    try {

        const { student_id, voice_url } = req.body;

        if (!student_id || !voice_url) {

            return response.error(
                res,
                "student_id and voice_url are required",
                400
            );

        }

        const owns = await morningGreetingService.parentOwnsStudent(
            req.user.id,
            student_id
        );

        if (!owns) {

            return response.error(
                res,
                "This student is not linked to your account",
                403
            );

        }

        const greeting = await morningGreetingService.submitGreeting(
            student_id,
            req.user.id,
            voice_url
        );

        return response.success(
            res,
            greeting,
            "Good Morning sent successfully",
            201
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            500
        );

    }

}

/**
 * Get today's greeting for a student (Parent's own dashboard)
 */
async function getTodaysGreeting(req, res) {

    try {

        const { studentId } = req.params;

        const owns = await morningGreetingService.parentOwnsStudent(
            req.user.id,
            studentId
        );

        if (!owns) {

            return response.error(
                res,
                "This student is not linked to your account",
                403
            );

        }

        const greeting = await morningGreetingService.getTodaysGreeting(studentId);

        return response.success(
            res,
            greeting || null,
            "Greeting retrieved successfully"
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            500
        );

    }

}

/**
 * Get today's greetings for a class teacher's students
 */
async function getTodaysGreetingsForClassTeacher(req, res) {

    try {

        const greetings = await morningGreetingService.getTodaysGreetingsForClassTeacher(
            req.user.id
        );

        return response.success(
            res,
            greetings,
            "Greetings retrieved successfully"
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            500
        );

    }

}

/**
 * React to a Good Morning greeting
 */
async function reactToGreeting(req, res) {

    try {

        const { greetingId } = req.params;

        const { reaction } = req.body;

        const allowedReactions = ["good", "nice", "great", "good_job"];

        if (!reaction || !allowedReactions.includes(reaction)) {

            return response.error(
                res,
                "A valid reaction is required.",
                400
            );

        }

        const greeting = await morningGreetingService.reactToGreeting(

            greetingId,

            req.user.id,

            reaction

        );

        return response.success(
            res,
            greeting,
            "Reaction saved successfully"
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            500
        );

    }

}

/**
 * React to multiple greetings at once
 */
async function bulkReactToGreetings(req, res) {

    try {

        const { greeting_ids, reaction } = req.body;

        const allowedReactions = ["good", "nice", "great", "good_job"];

        if (!Array.isArray(greeting_ids) || greeting_ids.length === 0) {

            return response.error(
                res,
                "greeting_ids must be a non-empty array.",
                400
            );

        }

        if (!reaction || !allowedReactions.includes(reaction)) {

            return response.error(
                res,
                "A valid reaction is required.",
                400
            );

        }

        const greetings = await morningGreetingService.bulkReactToGreetings(

            greeting_ids,

            req.user.id,

            reaction

        );

        return response.success(
            res,
            greetings,
            `Reacted to ${greetings.length} message(s)`
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            500
        );

    }

}

/**
 * Turn shared greeting viewing on/off for the teacher's class
 */
async function setSharedGreetingsSetting(req, res) {

    try {

        const { allow } = req.body;

        if (typeof allow !== "boolean") {

            return response.error(
                res,
                "allow must be true or false.",
                400
            );

        }

        await morningGreetingService.setSharedGreetingsForTeacher(

            req.user.id,

            allow

        );

        return response.success(
            res,
            { allow },
            "Setting updated successfully"
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            500
        );

    }

}

/**
 * Get the current shared-greetings setting for a teacher
 */
async function getSharedGreetingsSetting(req, res) {

    try {

        const allow = await morningGreetingService.getSharedGreetingsSetting(
            req.user.id
        );

        return response.success(
            res,
            { allow },
            "Setting retrieved successfully"
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            500
        );

    }

}

/**
 * Get today's classmate greetings for a Parent - only if the
 * class teacher has turned on shared viewing
 */
async function getTodaysGreetingsForClassmates(req, res) {

    try {

        const { studentId } = req.params;

        const greetings = await morningGreetingService.getTodaysGreetingsForClassmates(

            req.user.id,

            studentId

        );

        return response.success(
            res,
            greetings,
            "Classmates' greetings retrieved successfully"
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            403
        );

    }

}

module.exports = {

    submitGreeting,

    getTodaysGreeting,

    getTodaysGreetingsForClassTeacher,

    reactToGreeting,

    bulkReactToGreetings,

    setSharedGreetingsSetting,

    getSharedGreetingsSetting,

    getTodaysGreetingsForClassmates

};
