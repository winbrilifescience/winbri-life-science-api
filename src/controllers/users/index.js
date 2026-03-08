/**
 * @author Brijesh Prajapati
 * @description Export Users Controllers
 */

// Account Controllers
module.exports.createAccountController = require('./account/create-account');
module.exports.verification = require('./account/verification');
module.exports.loginController = require('./account/login');
module.exports.getProfileController = require('./account/get-profile');
module.exports.changePasswordController = require('./account/change-password');
module.exports.accountLockController = require('./account/lock-account');
module.exports.deleteAccountController = require('./account/delete-account');
module.exports.resetPasswordController = require('./account/reset-password');
module.exports.resendVerificationController = require('./account/resend-verification');
module.exports.updateProfileController = require('./account/update-user');
module.exports.authorizationUserController = require('./account/authorize-user');
module.exports.enableBusinessListingController = require('./account/enable-business-listing');
module.exports.enableInptaListingController = require('./account/enable-inpta-listing');
