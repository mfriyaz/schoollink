const academicYearService = require("../services/academicYear.service");
const currentYearService = require("../services/currentYear.service");
const yearRollover = require("../services/yearRollover.service");

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

/**
 * The school's current year (from the signed-in admin's school)
 */
async function getCurrentYear(req, res) {
    try {
        const year = await currentYearService.getCurrentYear(req.user.school_id);
        return res.json({ success: true, data: year });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

/**
 * All years of the signed-in admin's school
 */
async function listMyYears(req, res) {
    try {
        await currentYearService.getCurrentYear(req.user.school_id);
        const years = await yearRollover.listYears(req.user.school_id);
        return res.json({ success: true, data: years });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

/**
 * Start a new year and promote students
 */
async function startNewYear(req, res) {
    try {
        const result = await yearRollover.startNewYear(req.user.school_id, req.user.id || req.user.userId, req.body || {});
        return res.status(201).json({ success: true, message: "New academic year started", data: result });
    } catch (err) {
        return res.status(err.status || 500).json({ success: false, message: err.message });
    }
}

module.exports = {

    getCurrentYear,

    listMyYears,

    startNewYear,


    createAcademicYear,

    getAcademicYearsBySchool,

    getAcademicYearById,

    updateAcademicYear,

    deleteAcademicYear

};