/**
 * @author Brijesh Prajapati
 * @description Get ServiceEntries
 */

const httpStatus = require('http-status');
const response = require('../../../utils/response');
const asyncHandler = require('../../../core/asyncHandler');
const { ObjectId } = require('mongoose').Types;
const { ServiceEntryRepo } = require('../../../database');
const { PaginationHelper, MongoDBQueryBuilder } = require('../../../helpers');
const { ValidationError } = require('../../../core/errors');

const SEARCH_FIELDS = ['_id', 'entryNo', 'mobile', 'serviceName', 'paymentMode', 'status'];

const getServiceEntries = async (params = {}) => {
	const findQuery = {};

	if (params.id) {
		if (!ObjectId.isValid(params.id)) throw new ValidationError('Invalid Service Entry id');
		findQuery._id = params.id;
	}

	if (params.serviceName) findQuery.serviceName = params.serviceName;
	if (params.paymentMode) findQuery.paymentMode = params.paymentMode;
	if (params.status) findQuery.status = params.status;

	if (params.assignedUser) {
		if (!ObjectId.isValid(params.assignedUser)) throw new ValidationError('Invalid User id');
		findQuery.assignedUsers = params.assignedUser;
	}

	Object.assign(findQuery, MongoDBQueryBuilder.searchTextQuery(params.search, SEARCH_FIELDS));

	const pagination = PaginationHelper.getPagination(params);
	const sortQuery = MongoDBQueryBuilder.sortQuery(params.sort, params.sortOrder);

	const [totalCount, data] = await Promise.all([
		ServiceEntryRepo.countDocuments(findQuery),
		ServiceEntryRepo.find(findQuery).populate('assignedUsers', 'name mobile').skip(pagination.skip).limit(pagination.limit).sort(sortQuery).lean(),
	]);

	const paginationInfo = PaginationHelper.getPaginationInfo(totalCount, params);

	return {
		data,
		pagination: paginationInfo,
		searchFields: SEARCH_FIELDS,
	};
};

const getServiceEntryController = asyncHandler(async (req, res) => {
	req.logger.info('Controller > Admin > ServiceEntries > Get ServiceEntry');

	const { data, pagination, searchFields } = await getServiceEntries(req.query);

	return response(res, httpStatus.OK, 'success', data, undefined, {
		pagination,
		search_fields: searchFields,
	});
});

module.exports = getServiceEntryController;
