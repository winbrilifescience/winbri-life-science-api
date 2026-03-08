/**
 * @author Brijesh Prajapati
 * @description Routing to Controller for Incoming Request for /admin/v1
 */

const adminRoute = require('express').Router();

// -- Controllers --
const { adminControllers: controller, fileUploadController } = require('../controllers');
// const { DeleteGeneralCache } = require('../controllers/cache-manager');

// -- Middleware --
const { adminAuthenticationMiddleware } = require('../middleware');

// -- Routes --

// Account
// adminRoute.post('/create', controller.createAccountController);
adminRoute.post('/login', controller.loginController);
adminRoute.post('/login-with-otp', controller.loginWithOTPController.Login);
adminRoute.post('/login-with-otp/verify', controller.loginWithOTPController.VerifyOTP);
adminRoute.post('/oauth', controller.oAuthController);

adminRoute.post('/create-admin', controller.createAccountController);
// * Middleware
adminRoute.use(adminAuthenticationMiddleware);

// -- Authorized Routes --

// Account
adminRoute.get('/get-profile', controller.getProfileController);
adminRoute.post('/update-profile', controller.updateProfileController);
adminRoute.post('/change-password', controller.changePasswordController);
adminRoute.get('/get-universal-token', controller.getUniversalAccessController);

// Account
adminRoute.post('/admin-user/reset-password', controller.resetSubAdminPasswordController);
adminRoute.get('/admin-user/get-admin', controller.getAdminController);
adminRoute.post('/admin-user/remove-admin', controller.removeSubAdminPasswordController);
adminRoute.post('/admin-user/update-profile', controller.updateAdminProfileController);

// File Upload
adminRoute.post('/file-upload', fileUploadController);

// Users
adminRoute.get('/user/get', controller.getUserController);
adminRoute.post('/user/update', controller.updateUserController);
adminRoute.post('/user/lock', controller.unlockUserController);
adminRoute.post('/user/remove', controller.removeUserController);
adminRoute.post('/user/create', controller.createUserController);
adminRoute.get('/user/get-student-user', controller.getStudentUserController);

// Service Entry
adminRoute.post('/service-entry/add', controller.AddServiceController);
adminRoute.get('/service-entry/get', controller.getServiceController);
adminRoute.post('/service-entry/update', controller.updateServiceController);
// adminRoute.put('/service-entry/:id', serviceEntryController.update);
// adminRoute.delete('/service-entry/:id', serviceEntryController.remove);
// adminRoute.get('/service-entry', serviceEntryController.list);
// adminRoute.get('/service-entry/summary', serviceEntryController.summary);
// adminRoute.get('/service-entry/:id', serviceEntryController.getById);

module.exports = adminRoute;
