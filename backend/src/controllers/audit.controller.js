const auditService = require("../services/audit.service");

async function getAuditLogs(req, res) {

    try {

        const data = await auditService.listAuditLogs(
            req.user.school_id,
            req.query
        );

        return res.status(200).json({ success: true, data });

    } catch (error) {

        console.error(error);

        return res.status(500).json({ success: false, message: error.message });

    }

}

module.exports = { getAuditLogs };
