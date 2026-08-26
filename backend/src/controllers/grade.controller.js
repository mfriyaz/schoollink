const gradeService = require("../services/grade.service");

/**
 * Create Grade
 * (school_id is derived from the logged-in admin's own token,
 * never trusted from the request body - otherwise anyone could
 * create grade bands for a school that isn't theirs)
 */
async function createGrade(req, res) {

    try {

        const grade = await gradeService.createGrade({

            ...req.body,

            school_id: req.user.school_id

        });

        return res.status(201).json({
            success: true,
            message: "Grade created successfully",
            data: grade
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

}

/**
 * Get All Grades
 * (self-scoped from the JWT, not a client-supplied schoolId -
 * previously anyone could view another school's grading scale
 * just by changing the URL)
 */
async function getAllGrades(req, res) {

    try {

        const grades = await gradeService.getAllGrades(
            req.user.school_id
        );

        return res.status(200).json({
            success: true,
            data: grades
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

}

/**
 * Get Grade By ID, scoped to the caller's own school
 */
async function getGradeById(req, res) {

    try {

        const grade = await gradeService.getGradeById(
            req.params.id,
            req.user.school_id
        );

        if (!grade) {

            return res.status(404).json({
                success: false,
                message: "Grade not found"
            });

        }

        return res.status(200).json({
            success: true,
            data: grade
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

}

/**
 * Update Grade, scoped to the caller's own school
 */
async function updateGrade(req, res) {

    try {

        const grade = await gradeService.updateGrade(
            req.params.id,
            req.user.school_id,
            req.body
        );

        if (!grade) {

            return res.status(404).json({
                success: false,
                message: "Grade not found"
            });

        }

        return res.status(200).json({
            success: true,
            message: "Grade updated successfully",
            data: grade
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

}

/**
 * Delete Grade, scoped to the caller's own school
 */
async function deleteGrade(req, res) {

    try {

        const grade = await gradeService.deleteGrade(
            req.params.id,
            req.user.school_id
        );

        if (!grade) {

            return res.status(404).json({
                success: false,
                message: "Grade not found"
            });

        }

        return res.status(200).json({
            success: true,
            message: "Grade deleted successfully",
            data: grade
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

}

module.exports = {

    createGrade,

    getAllGrades,

    getGradeById,

    updateGrade,

    deleteGrade

};
