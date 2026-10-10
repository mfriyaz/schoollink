const auditService = require("../services/audit.service");

const studentMarkService = require("../services/studentMark.service");
const response = require("../utils/response");

/**
 * Create Student Mark
 */
async function createStudentMark(req, res) {

    try {

        if (req.user.role === "Teacher") {

            const owns = await studentMarkService.teacherOwnsExamSubject(
                req.user.id,
                req.body.exam_subject_id
            );

            if (!owns) {

                return response.error(
                    res,
                    "You are not assigned to this class/subject",
                    403
                );

            }

        }

        const studentMark =
            await studentMarkService.createStudentMark(req.body);

        const title = await auditService.describeExamSubject(req.body.exam_subject_id);

        await auditService.logAudit(req, {
            action: "Created",
            entityType: "marks",
            entityId: Number(req.body.exam_subject_id) || null,
            entityTitle: title || "Student mark",
            summary: `Mark entered: ${req.body.marks_obtained}`
        });

        return response.success(
            res,
            studentMark,
            "Student mark created successfully",
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
 * Get Roster With Marks
 */
async function getRosterWithMarks(req, res) {

    try {

        if (req.user.role === "Teacher") {

            const owns = await studentMarkService.teacherOwnsExamSubject(
                req.user.id,
                req.params.examSubjectId
            );

            if (!owns) {

                return response.error(
                    res,
                    "You are not assigned to this class/subject",
                    403
                );

            }

        }

        const roster = await studentMarkService.getRosterWithMarks(
            req.params.examSubjectId
        );

        return response.success(
            res,
            roster,
            "Roster retrieved successfully"
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
 * Bulk Mark An Exam Subject For A Whole Class
 */
async function bulkMarkExam(req, res) {

    try {

        const { exam_subject_id, records } = req.body;

        if (!exam_subject_id || !Array.isArray(records)) {

            return response.error(
                res,
                "exam_subject_id and records are required",
                400
            );

        }

        if (req.user.role === "Teacher") {

            const owns = await studentMarkService.teacherOwnsExamSubject(
                req.user.id,
                exam_subject_id
            );

            if (!owns) {

                return response.error(
                    res,
                    "You are not assigned to this class/subject",
                    403
                );

            }

        }

        let roster = [];

        try {
            roster = await studentMarkService.getRosterWithMarks(exam_subject_id);
        } catch (e) {
            roster = [];
        }

        const result = await studentMarkService.bulkMarkExam(
            exam_subject_id,
            records
        );

        try {

            const changes = [];
            let entered = 0;
            let changed = 0;

            for (const record of records) {

                const prior = roster.find(
                    (r) => Number(r.student_id) === Number(record.student_id)
                );

                const name = prior
                    ? `${prior.first_name || ""} ${prior.last_name || ""}`.trim()
                    : `Student #${record.student_id}`;

                const hadMark = prior && prior.marks_obtained !== null && prior.marks_obtained !== undefined;

                if (!hadMark) {
                    entered++;
                    changes.push({ field: name, from: "(empty)", to: String(record.marks_obtained) });
                } else if (Number(prior.marks_obtained) !== Number(record.marks_obtained)) {
                    changed++;
                    changes.push({ field: name, from: String(Number(prior.marks_obtained)), to: String(record.marks_obtained) });
                }

            }

            if (entered > 0 || changed > 0) {

                const title = await auditService.describeExamSubject(exam_subject_id);

                const parts = [];
                if (entered > 0) parts.push(`${entered} mark(s) entered`);
                if (changed > 0) parts.push(`${changed} mark(s) changed`);

                await auditService.logAudit(req, {
                    action: changed > 0 ? "Edited" : "Created",
                    entityType: "marks",
                    entityId: Number(exam_subject_id),
                    entityTitle: title || `Exam subject #${exam_subject_id}`,
                    summary: parts.join(", "),
                    changes
                });

            }

        } catch (err) {
            console.error("Audit (marks) failed:", err.message);
        }

        return response.success(
            res,
            result,
            "Marks saved successfully",
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
 * Get Marks By Exam Subject
 */
async function getMarksByExamSubject(req, res) {

    try {

        const marks =
            await studentMarkService.getMarksByExamSubject(
                req.params.examSubjectId
            );

        return response.success(
            res,
            marks,
            "Student marks retrieved successfully"
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
 * Get Marks By Student
 */
async function getMarksByStudent(req, res) {

    try {

        if (req.user.role === "Parent") {

            const owns = await studentMarkService.parentOwnsStudent(
                req.user.id,
                req.params.studentId
            );

            if (!owns) {

                return response.error(
                    res,
                    "This student is not linked to your account",
                    403
                );

            }

        }

        const marks =
            await studentMarkService.getMarksByStudent(
                req.params.studentId
            );

        return response.success(
            res,
            marks,
            "Student marks retrieved successfully"
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
 * Get Student Mark By ID
 */
async function getStudentMarkById(req, res) {

    try {

        const studentMark =
            await studentMarkService.getStudentMarkById(
                req.params.id
            );

        if (!studentMark) {

            return response.error(
                res,
                "Student mark not found",
                404
            );

        }

        return response.success(
            res,
            studentMark,
            "Student mark retrieved successfully"
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
 * Update Student Mark
 */
async function updateStudentMark(req, res) {

    try {

        let before = null;

        try {
            before = await studentMarkService.getStudentMarkById(req.params.id);
        } catch (e) {
            before = null;
        }

        const studentMark =
            await studentMarkService.updateStudentMark(
                req.params.id,
                req.body
            );

        if (!studentMark) {

            return response.error(
                res,
                "Student mark not found",
                404
            );

        }

        const title = await auditService.describeExamSubject(studentMark.exam_subject_id);

        await auditService.logAudit(req, {
            action: "Edited",
            entityType: "marks",
            entityId: studentMark.exam_subject_id,
            entityTitle: title || "Student mark",
            summary: "Mark edited",
            changes: auditService.diffFields(before, req.body, { marks_obtained: "Marks" })
        });

        return response.success(
            res,
            studentMark,
            "Student mark updated successfully"
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
 * Delete Student Mark
 */
async function deleteStudentMark(req, res) {

    try {

        const studentMark =
            await studentMarkService.deleteStudentMark(
                req.params.id
            );

        if (!studentMark) {

            return response.error(
                res,
                "Student mark not found",
                404
            );

        }

        return response.success(
            res,
            studentMark,
            "Student mark deleted successfully"
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

    createStudentMark,

    getRosterWithMarks,

    bulkMarkExam,

    getMarksByExamSubject,

    getMarksByStudent,

    getStudentMarkById,

    updateStudentMark,

    deleteStudentMark

};