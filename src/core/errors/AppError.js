/**
 * @description Base application error for consistent error handling
 * @extends Error
 */
class AppError extends Error {
	constructor(message, statusCode = 500, options = {}) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = options.isOperational ?? true;
		this.customCode = options.customCode;
		this.metadata = options.metadata;

		Error.captureStackTrace(this, this.constructor);
	}
}

module.exports = AppError;
