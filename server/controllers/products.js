const products = require("../models/products.js");
const path = require("path");
const fs = require("fs");
const { sendJsonResponse, convertImageToWebp, generateUniqueFileName, SortArrayByObjectField } = require("../utils/helpers.js");
const users = require("../models/users.js");
const ProductReviews = require("../models/productReviews.js");

const filePath = path.join(__dirname, "../assets/images");

const getProducts = async (request, response) => {
	let query = {};

	try {
		const payload = request.query;

		if (!payload?._id && (!payload?.page || !payload?.limit)) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		if (payload?._id) query._id = payload._id;
		if (payload?.isFeatured) query.isFeatured = payload.isFeatured;
		if (payload?.category) query.category = payload.category;
		if (payload?.isActive) query.isActive = payload.isActive;
		if (payload?.minPrice && payload?.maxPrice) {
			query.price = { $gte: payload.minPrice, $lte: payload.maxPrice };
		} else if (payload?.minPrice) {
			query.price = { $gte: payload.minPrice };
		} else if (payload?.maxPrice) {
			query.price = { $lte: payload.maxPrice };
		}

		const dbPayload = await products
			.find(query)
			.limit(payload?.limit)
			.skip(payload?.page && (payload?.page - 1) * payload?.limit);

		if (payload?.sortField) dbPayload.sort(SortArrayByObjectField(payload.sortField, payload?.sortReverse || false, null));

		if (dbPayload.length > 0) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record Found!", payload?._id ? dbPayload[0] : dbPayload);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "Record not Found!", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const createProduct = async (request, response) => {
	let media = [];

	try {
		const payload = request.body;
		const { userID: authenticatingUserID } = request.jwtPayload;
		const files = request.files;

		if (!files.length || !payload?.title || !payload?.price || !payload?.category) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const authenticatingDBUser = await users.findOne({ _id: authenticatingUserID });

		if (payload?.sellerID === authenticatingUserID || authenticatingDBUser?.userRole === "admin") {
			for (let file of files) {
				if (file.mimetype.startsWith("image")) file = await convertImageToWebp(file);

				const generatedFileName = generateUniqueFileName(file, filePath);
				const fileFullPath = path.join(filePath, generatedFileName);

				await fs.promises.writeFile(fileFullPath, file.buffer);
				media.push({ mimetype: file.mimetype, filename: generatedFileName });
			}

			payload.media = media;

			const product = new products({
				...payload,
				sellerID: payload?.sellerID || authenticatingUserID,
				createdBy: authenticatingUserID,
				updatedBy: authenticatingUserID,
			});

			const newProduct = await product.save();

			if (newProduct) {
				return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record created::success", newProduct);
			} else {
				return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record created::failure", null);
			}
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.UNAUTHORIZED, false, "Permission denied!", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const updateProduct = async (request, response) => {
	let media = [];

	try {
		const payload = request.body;
		const { userID: authenticatingUserID } = request.jwtPayload;
		const files = request.files;

		if (!payload._id) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const authenticatingDBUser = await users.findOne({ _id: authenticatingUserID });

		if (payload?.sellerID === authenticatingUserID || authenticatingDBUser?.userRole === "admin") {
			const dbProduct = await products.findOne({ _id: payload._id });

			if (files.length) {
				for (let file of files) {
					if (file.mimetype.startsWith("image")) file = await convertImageToWebp(file);

					const generatedFileName = generateUniqueFileName(file, filePath);
					const fileFullPath = path.join(filePath, generatedFileName);

					await fs.promises.writeFile(fileFullPath, file.buffer);

					media.push({ mimetype: file.mimetype, filename: generatedFileName });
				}

				payload.media = media;
			}

			const updatedProduct = await products.findOneAndUpdate(
				{ _id: payload._id },
				{ $set: { ...payload, updatedBy: authenticatingUserID } },
				{ new: true },
			);

			if (updatedProduct) {
				if (dbProduct?.media?.length) {
					for (let media of dbProduct.media) {
						const existingFilePath = path.join(filePath, media.filename);
						const isThereExistingFile = fs.existsSync(existingFilePath);

						if (isThereExistingFile) await fs.promises.unlink(existingFilePath);
					}
				}

				return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record updated::success", updatedProduct);
			} else {
				return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record updated::failure", null);
			}
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.UNAUTHORIZED, false, "Permission denied!", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const deleteProduct = async (request, response) => {
	try {
		const { _id: itemID } = request.query;

		if (!itemID) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const deletedPayload = await ProductReviews.findOneAndDelete({ _id: itemID }, { new: true });

		if (deletedPayload) {
			for (let media of deletedPayload.media) {
				const existingFilePath = path.join(filePath, media.filename);
				const isThereExistingFile = fs.existsSync(existingFilePath);

				if (isThereExistingFile) await fs.promises.unlink(existingFilePath);
			}

			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record delete::success", deletedPayload);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record delete::failure", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const getProductReviews = async (request, response) => {
	let query = {};

	try {
		const payload = request.query;

		if (!payload?._id && (!payload?.page || !payload?.limit)) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		if (payload?._id) query._id = payload._id;
		if (payload?.product) query.product = payload.product;
		if (payload?.reviewer) query.reviewer = payload.reviewer;
		if (payload?.rating) query.rating = payload.rating;
		if (payload?.isApproved) query.isApproved = payload.isApproved;

		const dbPayload = await ProductReviews.find(query)
			.limit(payload?.limit)
			.skip(payload?.page && (payload?.page - 1) * payload?.limit);

		if (dbPayload.length > 0) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record Found!", payload?._id ? dbPayload[0] : dbPayload);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "Record not Found!", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const createProductReview = async (request, response) => {
	try {
		const payload = request.body || {};
		const { userID: authenticatingUserID } = request?.jwtPayload || {};

		if (!payload?.reviewer || !payload?.rating) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const dbNewRecordObject = new ProductReviews({
			...payload,
			createdBy: authenticatingUserID,
			updatedBy: authenticatingUserID,
		});

		const createdPayload = await dbNewRecordObject.save();

		if (createdPayload) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record created::success", createdPayload);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record created::failure", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const updateProductReview = async (request, response) => {
	try {
		const payload = request.body;
		const { userID: authenticatingUserID } = request.jwtPayload;

		if (!payload._id) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const updatedPayload = await ProductReviews.findOneAndUpdate(
			{ _id: payload._id },
			{ $set: { ...payload, updatedBy: authenticatingUserID } },
			{ new: true },
		);

		if (updatedPayload) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record updated::success", updatedPayload);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record updated::failure", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const deleteProductReview = async (request, response) => {
	try {
		const { _id: itemID } = request.query;

		if (!itemID) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const deletedPayload = await ProductReviews.findOneAndDelete({ _id: itemID }, { new: true });

		if (deletedPayload) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record delete::success", deletedPayload);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record delete::failure", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

module.exports = {
	getProducts,
	createProduct,
	updateProduct,
	deleteProduct,
	getProductReviews,
	createProductReview,
	updateProductReview,
	deleteProductReview,
};
