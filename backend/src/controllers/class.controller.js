const classService = require("../services/class.service");

/**
 * Create Class
 */
async function createClass(req, res) {

    try {

        const newClass = await classService.createClass(req.body);

        return res.status(201).json({

            success: true,

            message: "Class created successfully",

            data: newClass

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

}

/**
 * Get Classes By Academic Year
 */
async function getClassesByAcademicYear(req, res) {

    try {

        const classes =
            await classService.getClassesByAcademicYear(
                req.params.academicYearId
            );

        return res.json({

            success: true,

            data: classes

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

}

/**
 * Get Class By ID
 */
async function getClassById(req, res) {

    try {

        const classData =
            await classService.getClassById(req.params.id);

        if (!classData) {

            return res.status(404).json({

                success: false,

                message: "Class not found"

            });

        }

        return res.json({

            success: true,

            data: classData

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

}

/**
 * Update Class
 */
async function updateClass(req, res) {

    try {

        const updatedClass =
            await classService.updateClass(
                req.params.id,
                req.body
            );

        return res.json({

            success: true,

            message: "Class updated successfully",

            data: updatedClass

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

}

/**
 * Delete Class
 */
async function deleteClass(req, res) {

    try {

        const deletedClass =
            await classService.deleteClass(req.params.id);

        return res.json({

            success: true,

            message: "Class deleted successfully",

            data: deletedClass

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

}

module.exports = {

    createClass,

    getClassesByAcademicYear,

    getClassById,

    updateClass,

    deleteClass

};