/**
 * Global Error Handler
 */

function errorHandler(err, req, res, next) {

    console.error("================================");
    console.error("ERROR:");
    console.error(err);
    console.error("================================");

    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({

        success: false,

        message: err.message || "Internal Server Error",

        stack:
            process.env.NODE_ENV === "development"
                ? err.stack
                : undefined

    });

}

module.exports = errorHandler;