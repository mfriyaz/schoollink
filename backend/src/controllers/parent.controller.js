const parentService = require("../services/parent.service");
const studentModel = require("../models/student.model");
const response = require("../utils/response");

/**
 * Get My Children
 */
async function getMyChildren(req, res) {

    try {

        const children =
            await parentService.getMyChildren(req.user.id);

        return response.success(
            res,
            children,
            "Children retrieved successfully"
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
 * Create (or reuse) a Parent account and link them to a
 * student. School Admin only - the student must belong to
 * their own school.
 */
async function createOrLinkParent(req, res) {

    try {

        const {
            student_id,
            relationship,
            existing_parent_email,
            full_name,
            email,
            mobile,
            temporary_password
        } = req.body;

        if (!student_id) {

            return response.error(
                res,
                "student_id is required",
                400
            );

        }

        const student = await studentModel.getStudentById(
            student_id,
            req.user.school_id
        );

        if (!student) {

            return response.error(
                res,
                "This student is not one of yours",
                403
            );

        }

        const result = await parentService.createOrLinkParent({

            school_id: req.user.school_id,

            student_id,

            relationship,

            existing_parent_email,

            full_name,

            email,

            mobile,

            temporary_password

        });

        return response.success(
            res,
            result,
            "Parent linked successfully",
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
 * Get every parent linked to a student
 */
async function getParentsForStudent(req, res) {

    try {

        const { studentId } = req.params;

        const student = await studentModel.getStudentById(
            studentId,
            req.user.school_id
        );

        if (!student) {

            return response.error(
                res,
                "This student is not one of yours",
                403
            );

        }

        const parents = await parentService.getParentsForStudent(studentId);

        return response.success(
            res,
            parents,
            "Parents retrieved successfully"
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

    getMyChildren,

    createOrLinkParent,

    getParentsForStudent

};
