const parentService = require("../services/parent.service");
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

module.exports = {

    getMyChildren

};
