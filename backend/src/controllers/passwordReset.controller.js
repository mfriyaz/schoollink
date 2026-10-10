const crypto = require("crypto");
const bcrypt = require("bcrypt");

const userModel = require("../models/user.model");
const auditService = require("../services/audit.service");
const response = require("../utils/response");

/**
 * Random, easy-to-read temporary password (no look-alike
 * characters such as 0/O or 1/l/I).
 */
function generateTempPassword() {

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

    let out = "";

    for (let i = 0; i < 10; i++) {

        out += chars[crypto.randomInt(chars.length)];

    }

    return out;

}

/**
 * School Admin resets the password of a Parent or Teacher in
 * their own school. The new temporary password is returned
 * once and never stored in plain text or in the audit log.
 */
async function resetUserPassword(req, res) {

    try {

        const target = await userModel.findUserById(req.params.userId);

        if (
            !target ||
            target.school_id !== req.user.school_id ||
            !["Parent", "Teacher"].includes(target.role_name)
        ) {

            return response.error(
                res,
                "This user is not one of yours",
                403
            );

        }

        const tempPassword = generateTempPassword();

        const hash = await bcrypt.hash(tempPassword, 10);

        await userModel.updateUserPassword(target.id, hash);

        await auditService.logAudit(req, {
            action: "reset_password",
            entityType: "user",
            entityId: target.id,
            entityTitle: target.full_name,
            summary: `Reset the login password of ${target.role_name} ${target.full_name}`
        });

        return response.success(
            res,
            { temporary_password: tempPassword },
            "Password reset successfully"
        );

    } catch (err) {

        return response.error(res, err.message, 500);

    }

}

module.exports = { resetUserPassword };
