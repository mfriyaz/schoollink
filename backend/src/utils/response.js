/**
 * Success Response
 */
function success(res, data = null, message = "Success", status = 200) {

    return res.status(status).json({

        success: true,

        message,

        data

    });

}

/**
 * Error Response
 */
function error(res, message = "Internal Server Error", status = 500) {

    return res.status(status).json({

        success: false,

        message

    });

}

module.exports = {

    success,

    error

};