/**
 * Database models - Medical Service Management
 */

// Admin
module.exports.AdminRepo = require('./admins');

// Users
module.exports.UserRepo = require('./users');

// User Service
module.exports.UserServiceRepo = require('./user_service');

// Otp
module.exports.OtpRepo = require('./otp');

// Service Entry
module.exports.ServiceEntryRepo = require('./service_entry');

// Service Entry
module.exports.CounterRepo = require('./counter');
