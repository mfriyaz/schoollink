const academicYearService = require("../services/academicYear.service");

/**
 * Create Academic Year
 */
async function createAcademicYear(req, res) {

    try {

        const academicYear =
            await academicYearService.createAcademicYear(req.body);

        return res.status(201).json({

            success: true,

            message: "Academic Year created successfully",

            data: academicYear

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

}

/**
 * Get All Academic Years
 */
async function getAcademicYearsBySchool(req, res) {

    try {

        const schoolId = req.params.schoolId;

        const academicYears =
            await academicYearService.getAcademicYearsBySchool(schoolId);

        return res.json({

            success: true,

            data: academicYears

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

}

/**
 * Get Academic Year By ID
 */
async function getAcademicYearById(req, res) {

    try {

        const academicYear =
            await academicYearService.getAcademicYearById(req.params.id);

        if (!academicYear) {

            return res.status(404).json({

                success: false,

                message: "Academic Year not found"

            });

        }

        return res.json({

            success: true,

            data: academicYear

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

}

/**
 * Update Academic Year
 */
async function updateAcademicYear(req, res) {

    try {

        const academicYear =
            await academicYearService.updateAcademicYear(

                req.params.id,

                req.body

            );

        if (!academicYear) {

            return res.status(404).json({

                success: false,

                message: "Academic Year not found"

            });

        }

        return res.json({

            success: true,

            message: "Academic Year updated successfully",

            data: academicYear

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

}

/**
 * Delete Academic Year
 */
async function deleteAcademicYear(req, res) {

    try {

        const academicYear =
            await academicYearService.deleteAcademicYear(req.params.id);

        return res.json({

            success: true,

            message: "Academic Year deleted successfully",

            data: academicYear

        });

    } catch (err) {

        return res.status(404).json({

            success: false,

            message: err.message

        });

    }

}

module.exports = {

    createAcademicYear,

    getAcademicYearsBySchool,

    getAcademicYearById,

    updateAcademicYear,

    deleteAcademicYear

};