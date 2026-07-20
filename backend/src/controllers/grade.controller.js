const gradeService = require("../services/grade.service");

/**
 * Create Grade
 */
async function createGrade(req, res) {

    try {

        const grade = await gradeService.createGrade(req.body);

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
 */
async function getAllGrades(req, res) {

    try {

        const grades = await gradeService.getAllGrades(
            req.params.schoolId
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
 * Get Grade By ID
 */
async function getGradeById(req, res) {

    try {

        const grade = await gradeService.getGradeById(
            req.params.id
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
 * Update Grade
 */
async function updateGrade(req, res) {

    try {

        const grade = await gradeService.updateGrade(
            req.params.id,
            req.body
        );

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
 * Delete Grade
 */
async function deleteGrade(req, res) {

    try {

        const grade = await gradeService.deleteGrade(
            req.params.id
        );

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