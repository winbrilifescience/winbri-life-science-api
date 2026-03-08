/**
 * @author Brijesh Prajapati
 * @description Export Razorpay Controller
 * @refactored Static imports for webhook handlers (avoids per-request require overhead)
 */

const httpStatus = require('http-status');
const response = require('../../utils/response');
const { webhookEvents } = require('../../common/razorpay-webhook');

// Orders API
module.exports.createOrderController = require('./create-order');
module.exports.getOrderByIDController = require('./get-order');
module.exports.updateOrderByIDController = require('./update-order');

// Payment API
module.exports.capturePaymentController = require('./capture-payment');
module.exports.getPayment = require('./get-payment');

// Webhook handlers (static imports)
const paymentCaptureWebhookController = require('./payment-capture.webhook');
const subscriptionWebhookController = require('./subscription.webhook');

module.exports.paymentCaptureWebhookController = paymentCaptureWebhookController;
module.exports.subscriptionCaptureWebhookController = subscriptionWebhookController;

// Webhook dispatcher
module.exports.webhookHandler = (req, res) => {
	const { event } = req.body;

	if (event === webhookEvents.paymentCapture) {
		return paymentCaptureWebhookController(req, res);
	}
	if ([webhookEvents.subscriptionActivated, webhookEvents.subscriptionAuthenticated, webhookEvents.subscriptionCancelled, webhookEvents.subscriptionPaused].includes(event)) {
		return subscriptionWebhookController(req, res);
	}
	return response(res, httpStatus.NOT_ACCEPTABLE, 'Unsupported Event. This webhook event is not supported by the server.');
};
