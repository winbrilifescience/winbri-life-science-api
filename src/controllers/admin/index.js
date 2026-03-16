/**
 * @author Brijesh Prajapati
 * @description Export Admin Controllers
 */

// Account Controllers
module.exports.createAccountController = require('./account/create-user');
module.exports.loginController = require('./account/login');
module.exports.loginWithOTPController = require('./account/login-with-otp');
module.exports.getProfileController = require('./account/get-profile');
module.exports.updateProfileController = require('./account/update-profile');
module.exports.changePasswordController = require('./account/change-password');
module.exports.getUniversalAccessController = require('./account/universal-access');

// Admin User Controller
module.exports.getAdminController = require('./admin-user/get-admin');
module.exports.updateAdminProfileController = require('./admin-user/update-profile');
module.exports.resetSubAdminPasswordController = require('./admin-user/reset-password');
module.exports.removeSubAdminPasswordController = require('./admin-user/remove-admin');

// oAuth
module.exports.oAuthController = require('./oauth/oauth.controller');

// User
module.exports.getUserController = require('./users/get-user');
module.exports.updateUserController = require('./users/update-user');
module.exports.unlockUserController = require('./users/unlock-user');
module.exports.removeUserController = require('./users/remove-user');
module.exports.createUserController = require('./users/create-user');
module.exports.getStudentUserController = require('./users/get-student-user');

// Product
module.exports.AddProductController = require('./products/add-product');
module.exports.updateProductController = require('./products/update-product');
module.exports.getProductController = require('./products/get-product');
module.exports.productTrackingStatusController = require('./products/set-tracking-status');

// Service
module.exports.AddServiceController = require('./service-entry/add-service');
module.exports.getServiceController = require('./service-entry/get-service');
module.exports.updateServiceController = require('./service-entry/update-service');
module.exports.removeServiceController = require('./service-entry/remove-service');
