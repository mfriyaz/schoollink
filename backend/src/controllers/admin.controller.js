const adminService = require("../services/admin.service");

async function createAdmin(req, res) {

    try {

        const admin = await adminService.createAdmin(req.body);

        return res.status(201).json({

            success: true,

            message: "School Administrator created successfully",

            data: admin

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

}

module.exports = {
    createAdmin
};