/**
 * @author Brijesh Prajapati
 * @description Remove Service Entry
 */

const httpStatus = require('http-status');
const { ServiceEntryRepo } = require('../../../database');
const { isEmpty } = require('lodash');
const { isValidObjectId } = require('mongoose');
const response = require('../../../utils/response');
const { entryStatus } = require('../../../common/constants');

module.exports = async (req, res) => {
	req.logger.info('Admin > ServiceEntries > Remove Service Entry');

	const { id } = req.body;

	try {
		if (isEmpty(id) || !isValidObjectId(id)) {
			return response(res, httpStatus.BAD_REQUEST, 'Invalid Id');
		}

		let result = await ServiceEntryRepo.findByIdAndUpdate({ _id: id }, { status: entryStatus.deleted }, { new: true });

		if (!result) {
			return response(res, httpStatus.BAD_REQUEST, 'Invalid Id');
		}

		return response(res, httpStatus.OK, 'Service Entry Removed Successfully');
	} catch (error) {
		return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong', error);
	}
};
