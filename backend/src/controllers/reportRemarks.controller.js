const db = require("../config/database");
const response = require("../utils/response");
const reportCardService = require("../services/reportCard.service");

const MAX_LEN = 1000;

/**
 * Save (or clear) the remarks on a student's report card.
 * School Admin and Teacher, own school only.
 */
async function saveRemarks(req, res) {

    try {

        const studentId = Number(req.params.studentId);
        const examId = Number(req.params.examId);

        if (!Number.isInteger(studentId) || !Number.isInteger(examId)) {
            return response.error(res, "Invalid student or exam.", 400);
        }

        const text = String((req.body || {}).remarks || "").trim();

        if (text.length > MAX_LEN) {
            return response.error(res, `Remarks are too long (maximum ${MAX_LEN} characters).`, 400);
        }

        const report = await reportCardService.getStudentReportCard(studentId, examId);

        if (!report.length) {
            return response.error(res, "No report card found for this student and exam.", 404);
        }

        if (report[0].school_id !== req.user.school_id) {
            return response.error(res, "This student does not belong to your school", 403);
        }

        const saved = await reportCardService.saveRemarks({
            schoolId: req.user.school_id,
            studentId,
            examId,
            remarks: text,
            userId: req.user.id,
            aiAssisted: (req.body || {}).ai_assisted === true
        });

        return response.success(res, { remarks: saved ? saved.remarks : "" }, text ? "Remarks saved" : "Remarks removed");

    } catch (err) {

        console.error("saveRemarks error", err);
        return response.error(res, "Unable to save remarks.", 500);

    }

}

/**
 * All remarks for a student (parent portal). Parents only see their own children.
 */
async function listStudentRemarks(req, res) {

    try {

        const studentId = Number(req.params.studentId);

        if (!Number.isInteger(studentId)) {
            return response.error(res, "Invalid student.", 400);
        }

        if (req.user.role === "Parent") {

            const owns = await reportCardService.parentOwnsStudent(req.user.id, studentId);

            if (!owns) {
                return response.error(res, "This student is not linked to your account", 403);
            }

        } else {

            const st = await db.query("SELECT school_id FROM students WHERE id = $1", [studentId]);

            if (!st.rows[0] || st.rows[0].school_id !== req.user.school_id) {
                return response.error(res, "This student does not belong to your school", 403);
            }

        }

        const rows = await reportCardService.listRemarksForStudent(studentId);

        return response.success(res, rows, "Remarks retrieved");

    } catch (err) {

        console.error("listStudentRemarks error", err);
        return response.error(res, "Unable to load remarks.", 500);

    }

}

module.exports = { saveRemarks, listStudentRemarks };
