/**
 * Medical Service Management - Application constants
 */

module.exports.common_environment = {
	development: 'development',
	production: 'production',
};

/** Role for auth and authorization */
module.exports.roles = {
	admin: 'ADMIN',
	user: 'USER', // Staff / Technician
};

/** Service types offered by the company */
module.exports.serviceTypes = {
	healthCheckup: 'Health Check-up',
	xray: 'X-ray',
	sleepStudy: 'Sleep Study',
	abpm: 'ABPM',
	audiometry: 'Audiometry',
};

/** Service entry status */
module.exports.entryStatus = {
	pending: 'Pending',
	completed: 'Completed',
	cancelled: 'Cancelled',
	deleted: 'Deleted',
};

/** Payment modes */
module.exports.paymentModes = {
	cash: 'Cash',
	upi: 'UPI',
	upiAndCash: 'UPI & Cash',
	card: 'Card',
	online: 'Online',
	other: 'Other',
};
