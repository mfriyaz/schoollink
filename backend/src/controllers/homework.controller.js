const homeworkService = require("../services/homework.service");
const teacherService = require("../services/teacher.service");
const response = require("../utils/response");

/**
 * Create Homework
 */
async function createHomework(req, res) {

    try {

        const homework =
            await homeworkService.createHomework(req.body);

        return response.success(
            res,
            homework,
            "Homework created successfully",
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
 * Get Homework For Student
 * (Parent's feed)
 */
async function getHomeworkForStudent(req, res) {

    try {

        const homework =
            await homeworkService.getHomeworkForStudent(
                req.params.studentId
            );

        return response.success(
            res,
            homework,
            "Homework retrieved successfully"
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
 * Get Homework By Teacher Subject
 */
async function getHomeworkByTeacherSubject(req, res) {

    try {

        const homework =
            await homeworkService.getHomeworkByTeacherSubject(
                req.params.teacherSubjectId
            );

        return response.success(
            res,
            homework,
            "Homework retrieved successfully"
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
 * Get Homework By ID
 */
async function getHomeworkById(req, res) {

    try {

        let teacherId = null;

        if (req.user.role === "Teacher") {

            const teacher = await teacherService.getTeacherByUserId(req.user.id);

            teacherId = teacher ? teacher.id : null;

        }

        const homework =
            await homeworkService.getHomeworkById(
                req.params.id,

                req.user.school_id,

                teacherId
            );

        if (!homework) {

            return response.error(
                res,
                "Homework not found",
                404
            );

        }

        return response.success(
            res,
            homework,
            "Homework retrieved successfully"
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
 * Update Homework
 */
async function updateHomework(req, res) {

    try {

        let teacherId = null;

        if (req.user.role === "Teacher") {

            const teacher = await teacherService.getTeacherByUserId(req.user.id);

            teacherId = teacher ? teacher.id : null;

        }

        const homework =
            await homeworkService.updateHomework(
                req.params.id,

                req.user.school_id,

                teacherId,

                req.body
            );

        if (!homework) {

            return response.error(
                res,
                "Homework not found",
                404
            );

        }

        return response.success(
            res,
            homework,
            "Homework updated successfully"
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
 * Delete Homework
 */
async function deleteHomework(req, res) {

    try {

        const homework =
            await homeworkService.deleteHomework(
                req.params.id
            );

        if (!homework) {

            return response.error(
                res,
                "Homework not found",
                404
            );

        }

        return response.success(
            res,
            homework,
            "Homework deleted successfully"
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

    createHomework,

    getHomeworkByTeacherSubject,

    getHomeworkForStudent,

    getHomeworkById,

    updateHomework,

    deleteHomework

};