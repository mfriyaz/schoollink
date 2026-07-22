const teacherDashboardService = require("../services/teacherDashboard.service");

/**
 * Get Teacher Dashboard
 */
async function getTeacherDashboard(req, res) {

    try {

        /*
         * Get teacher id
         *
         * Later we'll use:
         * const teacherId = req.user.teacher_id;
         *
         * For now we'll use URL parameter.
         */

        const { teacherId } = req.params;

        const dashboard =
            await teacherDashboardService.getTeacherDashboard(
                teacherId
            );

        return res.status(200).json({

            success: true,

            message: "Teacher dashboard loaded successfully.",

            data: dashboard

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

}

module.exports = {

    getTeacherDashboard

};