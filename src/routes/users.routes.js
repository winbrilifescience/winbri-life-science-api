/**
 * @author Brijesh Prajapati
 * @description Routing to Controller for Incoming Request for /user/v1
 */

const userRoute = require('express').Router({ caseSensitive: false });

// -- Config
userRoute.use('/account', require('express').static('src/public/verification-pages'));

// -- Controllers --
const { usersControllers: controller, fileUploadController, publicControllers } = require('../controllers');

// -- Middleware --
const { userAuthenticationMiddleware } = require('../middleware');

// -- Routes --

// Account
userRoute.post('/account/create-account', controller.createAccountController);
userRoute.get('/account/mail-verification', controller.verification.emailVerification); // Route for Email
userRoute.get('/account/lock', controller.accountLockController); // Route for Email
userRoute.post('/account/login', controller.loginController);
userRoute.post('/account/reset-password/:email', controller.resetPasswordController);
userRoute.post('/account/reset-password', controller.changePasswordController);
userRoute.post('/account/mobile-verification', controller.verification.mobileVerification);
userRoute.post('/account/email-verification', controller.verification.emailVerification);
userRoute.post('/account/authorization', controller.authorizationUserController.createLoginUser); // MOBILE OR EMAIL OTP
userRoute.post('/account/authorization/verify', controller.authorizationUserController.verifyUser); // MOBILE OR EMAIL OTP Verify

// * Middleware
userRoute.use(userAuthenticationMiddleware);

// -- Authorized Routes --

// Account
userRoute.get('/account/profile', controller.getProfileController);
userRoute.post('/account/update-profile', controller.updateProfileController);
userRoute.post('/account/change-password', controller.changePasswordController);
userRoute.post('/account/resend-verification-email', controller.resendVerificationController.sendVerificationEmail);
userRoute.post('/account/resend-verification-otp', controller.resendVerificationController.sendVerificationOTP);
userRoute.delete('/account/delete-account', controller.deleteAccountController);
userRoute.post('/account/enable-business-listing', controller.enableBusinessListingController);
userRoute.post('/account/enable-inpta-listing', controller.enableInptaListingController);

// File Upload
userRoute.post('/file-upload', (req, res, next) => ((req.params.directory = 'users'), next()), fileUploadController);

// Product
userRoute.get('/product/get', publicControllers.getProductsController);

module.exports = userRoute;
