/**
 * @description Centralized error classes for the application
 */

const AppError = require('./AppError');

class ValidationError extends AppError {
	constructor(message, details = null) {
		super(message, 400, { customCode: 'VALIDATION_ERROR', metadata: { details } });
	}
}

class UnauthorizedError extends AppError {
	constructor(message = 'Unauthorized') {
		super(message, 401, { customCode: 'UNAUTHORIZED' });
	}
}

class ForbiddenError extends AppError {
	constructor(message = 'Forbidden') {
		super(message, 403, { customCode: 'FORBIDDEN' });
	}
}

class NotFoundError extends AppError {
	constructor(message = 'Resource not found') {
		super(message, 404, { customCode: 'NOT_FOUND' });
	}
}

class ConflictError extends AppError {
	constructor(message = 'Resource conflict') {
		super(message, 409, { customCode: 'CONFLICT' });
	}
}

module.exports = {
	AppError,
	ValidationError,
	UnauthorizedError,
	ForbiddenError,
	NotFoundError,
	ConflictError,
};
