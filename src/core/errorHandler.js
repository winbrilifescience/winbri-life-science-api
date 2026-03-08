/**
 * @description Global error handler middleware
 * Must be registered as the last middleware (after all routes)
 */

const httpStatus = require('http-status');
const response = require('../utils/response');
const { common_environment } = require('../common/constants');
// const AppConfig = require('../config/default.json');

const errorHandler = (err, req, res, next) => {
	// Already sent response (e.g. from response util)
	if (res.headersSent) return next(err);

	// Log unexpected errors
	if (!err.isOperational && req.logger) {
		req.logger.error(`Unhandled Error: ${err.message}`, { stack: err.stack });
	}

	// Joi validation errors
	if (err.isJoi) {
		return response(res, httpStatus.BAD_REQUEST, err.message, err.details);
	}

	// Mongoose validation errors
	if (err.name === 'ValidationError') {
		const details = Object.values(err.errors).map((e) => ({ path: e.path, message: e.message }));
		return response(res, httpStatus.BAD_REQUEST, 'Validation failed', details);
	}

	// Mongoose cast error (invalid ObjectId)
	if (err.name === 'CastError') {
		return response(res, httpStatus.BAD_REQUEST, `Invalid ${err.path}: ${err.value}`);
	}

	// Custom AppError (operational errors)
	if (err.statusCode) {
		return response(res, err.statusCode, err.message, err.data ?? err.metadata, err.customCode, err.metadata, { sort: true, terminateAttachedLogger: true });
	}

	// Default: 500 Internal Server Error
	const message = process.env.NODE_ENV === common_environment.production ? 'Internal server error' : err.message;

	return response(res, httpStatus.INTERNAL_SERVER_ERROR, message, err, undefined, undefined, {
		sort: false,
		terminateAttachedLogger: true,
	});
};

module.exports = errorHandler;
