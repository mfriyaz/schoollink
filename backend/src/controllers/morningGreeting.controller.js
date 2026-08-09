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

module.exports = {

    submitGreeting,

    getTodaysGreeting,

    getTodaysGreetingsForClassTeacher

};
