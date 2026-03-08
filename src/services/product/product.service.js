/**
 * @description Product Service - Business logic layer for product operations
 * Separates concerns: Controllers handle HTTP, Services handle business logic & data access
 */

const { ObjectId } = require('mongoose').Types;
const { ProductsRepo } = require('../../database');
const { PaginationHelper, MongoDBQueryBuilder } = require('../../helpers');
const { NotFoundError, ValidationError } = require('../../core/errors');

const SEARCH_FIELDS = ['_id', 'name', 'categories', 'fabric', 'sub_categories', 'variants.sku_no', 'variants.color_name', 'variants.size'];

class ProductService {
	/**
	 * Get paginated products with optional filters
	 * @param {Object} params - { id?, search?, page?, limit?, sort?, sortOrder? }
	 * @returns {Promise<{ data: Array, pagination: Object, searchFields: Array }>}
	 */
	async getProducts(params = {}) {
		const findQuery = { status: true };

		if (params.id) {
			if (!ObjectId.isValid(params.id)) {
				throw new ValidationError('Invalid product id');
			}
			findQuery._id = params.id;
		}

		Object.assign(findQuery, MongoDBQueryBuilder.searchTextQuery(params.search, SEARCH_FIELDS));

		const pagination = PaginationHelper.getPagination(params);
		const sortQuery = MongoDBQueryBuilder.sortQuery(params.sort, params.sortOrder);

		const [totalCount, data] = await Promise.all([ProductsRepo.countDocuments(findQuery), ProductsRepo.find(findQuery).skip(pagination.skip).limit(pagination.limit).sort(sortQuery).lean()]);

		const paginationInfo = PaginationHelper.getPaginationInfo(totalCount, params);

		return {
			data,
			pagination: paginationInfo,
			searchFields: SEARCH_FIELDS,
		};
	}

	/**
	 * Get single product by ID
	 * @param {string} productId
	 * @returns {Promise<Object>}
	 */
	async getProductById(productId) {
		if (!ObjectId.isValid(productId)) {
			throw new ValidationError('Invalid product id');
		}

		const product = await ProductsRepo.findById(productId).lean();

		if (!product) {
			throw new NotFoundError('Product not found');
		}

		return product;
	}
}

module.exports = new ProductService();
