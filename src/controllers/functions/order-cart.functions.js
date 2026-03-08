const { isUndefined } = require('lodash');
const { itemType } = require('../../common');
const { OrderCartsRepo, ProductsRepo } = require('../../database');
const { JoiObjectIdValidator } = require('../../helpers/joi-custom-validators.helpers');
const { convertToObjectId } = require('../../helpers/mongodb-query-builder.helpers');
const { Joi } = require('../../services');

const validItemType = [itemType.clothing];

/**
 * Get active cart and populate only selected variant
 */
async function getActiveCart(params) {
	const paramsSchema = Joi.object()
		.keys({
			user_id: Joi.custom(JoiObjectIdValidator).optional(),
			cart_id: Joi.custom(JoiObjectIdValidator).optional(),
			item_type: Joi.string()
				.valid(...validItemType)
				.optional(),
			is_purchased: Joi.boolean().optional(),
		})
		.default({});

	const { error, value } = paramsSchema.validate(params);
	if (error) throw error;
	params = value;

	let findQuery = {};
	if (params.user_id) findQuery.user_id = convertToObjectId(params.user_id);
	if (params.cart_id) findQuery._id = convertToObjectId(params.cart_id);
	if (params.item_type) findQuery.item_type = params.item_type;
	if (!isUndefined(params.is_purchased)) findQuery.is_purchased = params.is_purchased;

	const carts = await OrderCartsRepo.find(findQuery).lean();

	for (const cart of carts) {
		if (!cart.items || !cart.items.length) continue;

		cart.items_details = await Promise.all(
			cart.items.map(async (item) => {
				const product = await ProductsRepo.findById(item.item_id).lean();
				if (!product) return null;

				let selectedVariant = null;
				if (item.variant_id) {
					selectedVariant = product.variants.find((v) => v._id.toString() === item.variant_id.toString());
				}

				return {
					_id: product._id,
					display_image: product.display_image,
					name: product.name,
					price: product.price,
					variant: selectedVariant || null,
				};
			})
		);

		cart.items_details = cart.items_details.filter(Boolean);
	}

	return carts;
}

module.exports.getActiveCart = getActiveCart;

/**
 * Add item to cart and store variant_id correctly
 */
async function addItemToCart(params) {
	const paramsSchema = Joi.object()
		.keys({
			user_id: Joi.custom(JoiObjectIdValidator).required(),
			item_id: Joi.custom(JoiObjectIdValidator).required(),
			variant_id: Joi.custom(JoiObjectIdValidator).optional(),
			item_type: Joi.string()
				.valid(...validItemType)
				.required(),
			quantity: Joi.number().integer().min(1).default(1).required(),
			notes: Joi.object({}).optional(),
		})
		.required();

	const { error, value } = paramsSchema.validate(params);
	if (error) throw error;
	params = value;

	console.log('params :- ', params);

	params.user_id = convertToObjectId(params.user_id);
	params.item_id = convertToObjectId(params.item_id);
	if (params.variant_id) params.variant_id = convertToObjectId(params.variant_id);

	// Validate product and variant
	if (params.item_type === itemType.clothing) {
		const product = await ProductsRepo.findById(params.item_id).lean();
		if (!product) throw new Error('Product does not exist for given id');

		if (params.variant_id) {
			const variantExists = product.variants.some((v) => v._id.equals(params.variant_id));
			if (!variantExists) throw new Error('Variant does not exist for given id');
		}
	}

	// Find active cart
	let activeCart = await getActiveCart({
		user_id: params.user_id,
		item_type: params.item_type,
		is_purchased: false,
	});

	if (!activeCart.length) {
		activeCart = await OrderCartsRepo.create({
			user_id: params.user_id,
			item_type: params.item_type,
			items: [],
		});
	} else {
		activeCart = activeCart[0];
	}

	// Check if same product + variant exists
	const itemIndex = activeCart.items.findIndex((item) => {
		if (params.variant_id) {
			return item.item_id.equals(params.item_id) && item.variant_id?.equals(params.variant_id);
		}
		return item.item_id.equals(params.item_id) && !item.variant_id;
	});

	let updatedCart;
	if (itemIndex === -1) {
		// Add new item
		updatedCart = await OrderCartsRepo.findOneAndUpdate(
			{ _id: activeCart._id },
			{
				$push: {
					items: {
						item_id: params.item_id,
						variant_id: params.variant_id || null,
						item_type: params.item_type,
						quantity: params.quantity,
						notes: params.notes,
					},
				},
			},
			{ new: true }
		).orFail();

		return updatedCart.items[updatedCart.items.length - 1];
	} else {
		// Update existing item
		updatedCart = await OrderCartsRepo.findOneAndUpdate(
			{
				_id: activeCart._id,
				'items.item_id': params.item_id,
				'items.variant_id': params.variant_id || null,
			},
			{
				$set: {
					'items.$.quantity': params.quantity,
					'items.$.updatedAt': new Date(),
					'items.$.notes': params.notes,
				},
			},
			{ new: true }
		).orFail();

		return updatedCart.items.find((item) => item.item_id.equals(params.item_id) && (!params.variant_id || item.variant_id?.equals(params.variant_id)));
	}
}

module.exports.addItemToCart = addItemToCart;

/**
 * Remove item from cart
 */
async function removeItemFromCart(params) {
	const paramsSchema = Joi.object().keys({
		user_id: Joi.custom(JoiObjectIdValidator).required(),
		cart_id: Joi.custom(JoiObjectIdValidator).required(),
		item_id: Joi.custom(JoiObjectIdValidator).required(),
	});

	const { error, value } = paramsSchema.validate(params);
	if (error) throw error;
	params = value;

	params.user_id = convertToObjectId(params.user_id);
	params.cart_id = convertToObjectId(params.cart_id);
	params.item_id = convertToObjectId(params.item_id);

	return OrderCartsRepo.findOneAndUpdate(
		{
			_id: params.cart_id,
			is_purchased: false,
			user_id: params.user_id,
			'items._id': params.item_id,
		},
		{
			$pull: {
				items: { _id: params.item_id },
			},
		}
	).orFail();
}

module.exports.removeItemFromCart = removeItemFromCart;
