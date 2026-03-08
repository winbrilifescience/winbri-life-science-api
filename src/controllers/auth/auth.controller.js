/**
 * Auth controller - Login and Register
 * Unified auth: login returns token with role (ADMIN | USER)
 */

const httpStatus = require('http-status');
const { AdminRepo, UserRepo } = require('../../database');
const { bcryptjs, jwt } = require('../../services');
const response = require('../../utils/response');
const { roles } = require('../../common/constants');
const asyncHandler = require('../../core/asyncHandler');

/**
 * POST /auth/login
 * Body: { email, password }
 * Returns token for Admin or User (first match)
 */
const login = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return response(res, httpStatus.BAD_REQUEST, 'Email and password are required');
	}

	const normalizedEmail = String(email).trim().toLowerCase();

	// Try Admin first
	let entity = await AdminRepo.findOne({ email: normalizedEmail, status: true }).select('+password +authToken').lean();
	let role = roles.admin;

	if (!entity) {
		entity = await UserRepo.findOne({ email: normalizedEmail, status: true }).select('+password +authToken').lean();
		role = roles.user;
	}

	if (!entity) {
		return response(res, httpStatus.UNAUTHORIZED, 'Invalid email or password');
	}

	const isMatch = await bcryptjs.compare(password, entity.password);
	if (!isMatch) {
		return response(res, httpStatus.UNAUTHORIZED, 'Invalid email or password');
	}

	const payload = {
		id: entity._id,
		role,
		authToken: entity.authToken,
		email: entity.email,
	};

	const token = jwt.sign(payload, '30d');

	return response(res, httpStatus.OK, 'Login successful', {
		authorization: token,
		role,
		email: entity.email,
	});
});

/**
 * POST /auth/register
 * Body: { email, password, first_name, last_name, mobile? }
 * Creates a new User (Staff/Technician). Admin creation can be done via seed or separate internal tool.
 */
const register = asyncHandler(async (req, res) => {
	const { email, password, first_name, last_name, mobile } = req.body;

	if (!email || !password || !first_name || !last_name) {
		return response(res, httpStatus.BAD_REQUEST, 'email, password, first_name and last_name are required');
	}

	const normalizedEmail = String(email).trim().toLowerCase();

	const existing = await UserRepo.findOne({ email: normalizedEmail });
	if (existing) {
		return response(res, httpStatus.CONFLICT, 'User with this email already exists');
	}

	const hashedPassword = await bcryptjs.hash(password);
	const user = await UserRepo.create({
		email: normalizedEmail,
		password: hashedPassword,
		first_name: first_name.trim(),
		last_name: last_name.trim(),
		mobile: mobile ? String(mobile).trim() : undefined,
		role: roles.user,
		status: true,
	});

	// Return user without password
	// const { password: _, ...userWithoutPassword } = user.toObject();
	// return response(res, httpStatus.CREATED, 'Registration successful', userWithoutPassword);

	const userWithoutPassword = user.toObject();
	delete userWithoutPassword.password;

	return response(res, httpStatus.CREATED, 'Registration successful', userWithoutPassword);
});

module.exports = {
	login,
	register,
};
