const pool = require("../config/database");
const response = require("../utils/response");
const profileService = require("../services/studentProfile.service");

/**
 * School Admin, or a Teacher who teaches this student's class and section.
 * (The route has already checked that the student belongs to the caller's school.)
 */
async function getProfile(req, res) {

    try {

        const studentId = Number(req.params.id);

        if (req.user.role === "Teacher") {

            const owns = await pool.query(
                `SELECT 1
                   FROM students s
                   JOIN teacher_subjects ts ON ts.class_id = s.class_id AND ts.section_id = s.section_id
                   JOIN teachers t ON t.id = ts.teacher_id
                  WHERE s.id = $1 AND t.user_id = $2 AND ts.ended_at IS NULL
                  LIMIT 1`,
                [studentId, req.user.id]
            );

            if (owns.rows.length === 0) {

                return response.error(res, "You do not teach this student's class.", 403);

            }

        }

        const data = await profileService.getProfile(studentId);

        if (!data) return response.error(res, "Student not found", 404);

        return response.success(res, data, "Student profile");

    } catch (err) {

        console.error("Student profile error:", err.message);

        return response.error(res, "Unable to load this student.", 500);

    }

}

module.exports = { getProfile };
