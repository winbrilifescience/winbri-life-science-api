/**
 * @author Brijesh Prajapati
 * @description Add Service Entry (Medical Clinic)
 */

const httpStatus = require('http-status');
const { ServiceEntryRepo } = require('../../../database');
const response = require('../../../utils/response');
const { Joi } = require('../../../services');
const { JoiObjectIdValidator } = require('../../../helpers/joi-custom-validators.helpers');
const { serviceTypes, paymentModes } = require('../../../common/constants');
const generateSequence = require('../../../utils/generateSequence');

module.exports = async (req, res) => {
	req.logger.info('Controller > Admin > Service Entry > Add Service Entry');

	let adminAuthData = req.headers.adminAuthData;

	const BodySchema = Joi.object({
		serviceName: Joi.string()
			.valid(...Object.values(serviceTypes))
			.required(),
		amount: Joi.number().min(0).required(),
		assignedUsers: Joi.array().items(Joi.string().custom(JoiObjectIdValidator)).optional(),
		healthCheckupAssignments: Joi.array().items(
			Joi.object({
				user: Joi.string().custom(JoiObjectIdValidator).required(),
				task: Joi.array()
					.items(Joi.string().valid('COLLECTION', 'ECG', 'PFT'))
					.min(1)
					.required(),
			})
		),
		address: Joi.string().allow('', null),
		location: Joi.string().allow('', null),
		mobile: Joi.string().allow('', null),
		paymentMode: Joi.string()
			.valid(...Object.values(paymentModes))
			.optional(),
		receivedAmount: Joi.number().min(0).optional(),
	});

	const { error } = BodySchema.validate(req.body, { abortEarly: false });
	if (error) return response(res, error);

	let { serviceName, amount, assignedUsers, healthCheckupAssignments, address, location, mobile, paymentMode, receivedAmount } = req.body;

	try {
		const entryNo = await generateSequence('serviceEntry');

		if (serviceName !== serviceTypes.healthCheckup) {
			healthCheckupAssignments = [];
		}

		let payload = {
			entryNo,
			serviceName,
			amount,
			assignedUsers,
			healthCheckupAssignments,
			address,
			location,
			mobile,
			paymentMode,
			receivedAmount,
			createdBy: adminAuthData.id,
			updatedBy: adminAuthData.id,
		};

		const result = await ServiceEntryRepo.create(payload);

		return response(res, httpStatus.OK, 'Service Entry Created Successfully', result);
	} catch (error) {
		req.logger.error(error);
		return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong', error);
	}
};
