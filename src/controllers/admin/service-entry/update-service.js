/**
 * @author Brijesh Prajapati
 * @description Update Service Entry
 */

const httpStatus = require('http-status');
const { ServiceEntryRepo } = require('../../../database');
const response = require('../../../utils/response');
const { Joi } = require('../../../services');
const { JoiObjectIdValidator } = require('../../../helpers/joi-custom-validators.helpers');
const { serviceTypes, paymentModes, entryStatus } = require('../../../common/constants');

module.exports = async (req, res) => {
	req.logger.info('Controller > Admin > ServiceEntry > Update Service Entry');

	let adminAuthData = req.headers.adminAuthData;

	const BodySchema = Joi.object({
		id: Joi.string().custom(JoiObjectIdValidator).required(),
		serviceName: Joi.string()
			.valid(...Object.values(serviceTypes))
			.optional(),
		amount: Joi.number().min(0).optional(),
		assignedUsers: Joi.array().items(Joi.string().custom(JoiObjectIdValidator)).optional(),
		healthCheckupAssignments: Joi.array()
			.items(
				Joi.object({
					user: Joi.string().custom(JoiObjectIdValidator).required(),
					task: Joi.array()
						.items(Joi.string().valid('COLLECTION', 'ECG', 'PFT'))
						.min(1)
						.required(),
				})
			)
			.optional(),
		address: Joi.string().allow('', null).optional(),
		location: Joi.string().allow('', null).optional(),
		mobile: Joi.string().allow('', null).optional(),
		paymentMode: Joi.string()
			.valid(...Object.values(paymentModes))
			.optional(),
		upiReceivedAmount: Joi.number().min(0).optional(),
		cashReceivedAmount: Joi.number().min(0).optional(),
		status: Joi.string()
			.valid(...Object.values(entryStatus))
			.optional(),
	});

	const { error } = BodySchema.validate(req.body, { abortEarly: false });
	if (error) return response(res, error);

	let { id, serviceName, amount, assignedUsers, healthCheckupAssignments, address, location, mobile, paymentMode, upiReceivedAmount, cashReceivedAmount, status } = req.body;

	try {
		let payload = {
			serviceName,
			amount,
			assignedUsers,
			healthCheckupAssignments,
			address,
			location,
			mobile,
			paymentMode,
			upiReceivedAmount,
			cashReceivedAmount,
			status,
			updatedBy: adminAuthData.id,
		};

		if (serviceName && serviceName !== serviceTypes.healthCheckup) {
			payload.healthCheckupAssignments = [];
		}

		Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

		return ServiceEntryRepo.findOneAndUpdate({ _id: id }, payload, { new: true })
			.then((result) => (result ? response(res, httpStatus.OK, 'success', result) : response(res, httpStatus.OK, 'Incorrect service entry id')))
			.catch((error) => response(res, httpStatus.INTERNAL_SERVER_ERROR, 'something went wrong', error));
	} catch (error) {
		return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong', error);
	}
};
