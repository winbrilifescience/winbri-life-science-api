/**
 * User (Staff) - Assigned entries and update status
 */

const httpStatus = require('http-status');
const response = require('../../utils/response');
const serviceEntryService = require('../../services/serviceEntry/serviceEntry.service');
const asyncHandler = require('../../core/asyncHandler');
const { updateStatusSchema } = require('../../validators/serviceEntry.validator');

const getAssignedEntries = asyncHandler(async (req, res) => {
	const items = await serviceEntryService.listAssignedToUser(req.auth.id);
	return response(res, httpStatus.OK, 'Success', items);
});

const updateStatus = asyncHandler(async (req, res) => {
	const { error, value } = updateStatusSchema.validate(req.body);
	if (error) return response(res, httpStatus.BAD_REQUEST, error.message, error.details);

	const entry = await serviceEntryService.updateStatus(req.params.id, value.status, req.auth.id);
	return response(res, httpStatus.OK, 'Status updated', entry);
});

module.exports = {
	getAssignedEntries,
	updateStatus,
};
