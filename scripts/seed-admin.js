/**
 * One-time script to create first Admin user
 * Run: node scripts/seed-admin.js
 * Set env: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME (optional)
 */

require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const AdminSchema = new mongoose.Schema(
	{
		full_name: String,
		email: { type: String, required: true, unique: true },
		mobile: String,
		password: { type: String, required: true },
		role: { type: String, default: 'ADMIN' },
		status: { type: Boolean, default: true },
		authToken: Number,
	},
	{ timestamps: true, collection: 'admins' }
);
const Admin = mongoose.model('Admin', AdminSchema, 'admins');

async function seed() {
	if (!process.env.MONGODB_URI) {
		console.error('MONGODB_URI required');
		process.exit(1);
	}
	const email = process.env.ADMIN_EMAIL || 'admin@example.com';
	const password = process.env.ADMIN_PASSWORD || 'Admin@123';
	const full_name = process.env.ADMIN_NAME || 'Admin';

	await mongoose.connect(process.env.MONGODB_URI);
	const existing = await Admin.findOne({ email });
	if (existing) {
		console.log('Admin already exists:', email);
		process.exit(0);
	}
	const hash = bcryptjs.hashSync(password, 6);
	await Admin.create({
		full_name,
		email,
		password: hash,
		role: 'ADMIN',
		status: true,
		authToken: Math.floor(100000 + Math.random() * 900000),
	});
	console.log('Admin created:', email);
	process.exit(0);
}
seed().catch((err) => {
	console.error(err);
	process.exit(1);
});
