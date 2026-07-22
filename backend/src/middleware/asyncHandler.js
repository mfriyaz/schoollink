/**
 * Async Handler
 *
 * Automatically catches async errors
 * and forwards them to the global
 * error handler.
 */

const asyncHandler = (fn) => {

    return (req, res, next) => {

        Promise.resolve(

            fn(req, res, next)

        ).catch(next);

    };

};

module.exports = asyncHandler;