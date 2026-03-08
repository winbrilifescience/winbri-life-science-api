/**
 * @author Brijesh Prajapati
 * @description Get Products (with Variants)
 * @refactored Uses Service layer + asyncHandler for clean error propagation
 */

const httpStatus = require('http-status');
const response = require('../../../utils/response');
const productService = require('../../../services/product/product.service');
const asyncHandler = require('../../../core/asyncHandler');

const getProductController = asyncHandler(async (req, res) => {
	req.logger.info('Controller > Admin > Products > Get Product');

	const { data, pagination, searchFields } = await productService.getProducts(req.query);

	return response(res, httpStatus.OK, 'success', data, undefined, {
		pagination,
		search_fields: searchFields,
	});
});

module.exports = getProductController;
