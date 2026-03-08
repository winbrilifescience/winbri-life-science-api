/**
 * Role-based auth middleware
 * Expects JWT in Authorization header; validates and attaches auth payload to req.auth
 */

const httpStatus = require('http-status');
const { isEmpty } = require('lodash');
const response = require('../utils/response');
const { jwt, nodeCache } = require('../services');
const { AdminRepo, UserRepo } = require('../database');
const { roles } = require('../common/constants');

const AuthorizationCache = nodeCache('Authorization');
const CACHE_TTL = 60 * 5; // 5 minutes

/**
 * Generic auth: verify JWT and load user (Admin or User by role in token)
 */
const authenticate = async (req, res, next) => {
	try {
		const authorization = req.headers.authorization;

		if (isEmpty(authorization)) {
			return response(res, httpStatus.UNAUTHORIZED, 'Token is required');
		}

		const tokenResult = jwt.verify(authorization);
		if (!tokenResult) {
			return response(res, httpStatus.UNAUTHORIZED, 'Invalid or expired token');
		}

		const cacheKey = `auth:${tokenResult.role}:${tokenResult.id}`;
		if (AuthorizationCache.has(cacheKey)) {
			req.auth = AuthorizationCache.get(cacheKey);
			AuthorizationCache.ttl(cacheKey, CACHE_TTL);
			return next();
		}

		if (tokenResult.role === roles.admin) {
			const admin = await AdminRepo.findOne({ _id: tokenResult.id, status: true }).select('+authToken').lean();
			if (!admin || admin.authToken !== tokenResult.authToken) {
				return response(res, httpStatus.UNAUTHORIZED, 'Invalid token');
			}
			req.auth = { id: admin._id, role: roles.admin, email: admin.email, authToken: admin.authToken };
		} else {
			const user = await UserRepo.findOne({ _id: tokenResult.id, status: true }).select('+authToken').lean();
			if (!user || user.authToken !== tokenResult.authToken) {
				return response(res, httpStatus.UNAUTHORIZED, 'Invalid token');
			}
			req.auth = { id: user._id, role: roles.user, email: user.email, authToken: user.authToken };
		}

		AuthorizationCache.set(cacheKey, req.auth, CACHE_TTL);
		next();
	} catch (error) {
		return response(res, httpStatus.INTERNAL_SERVER_ERROR, 'Authentication error', error);
	}
};

/** Require Admin role */
const requireAdmin = (req, res, next) => {
	if (req.auth && req.auth.role === roles.admin) return next();
	return response(res, httpStatus.FORBIDDEN, 'Admin access required');
};

/** Require User (Staff) role */
const requireUser = (req, res, next) => {
	if (req.auth && req.auth.role === roles.user) return next();
	return response(res, httpStatus.FORBIDDEN, 'User access required');
};

module.exports = {
	authenticate,
	requireAdmin,
	requireUser,
};
