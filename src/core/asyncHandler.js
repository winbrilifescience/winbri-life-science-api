/**
 * @description Wraps async route handlers to automatically catch errors and pass to next()
 * Eliminates repetitive try-catch blocks in controllers
 * @param {Function} fn - Async handler function (req, res, next)
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
