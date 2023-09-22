const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const { sendJsonResponse } = require("../utils/helpers");
const products = require("../models/products");
const categories = require("../models/categories");

const filePath = path.join(__dirname, "../assets/images");

const getMedia = async (request, response) => {
	try {
		const { filename, width, mimetype } = request.query;

		if (!filename || !mimetype) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const fileFullPath = path.join(filePath, filename);
		const isFileExists = fs.existsSync(fileFullPath);

		const sourceFile = fs.readFileSync(isFileExists ? fileFullPath : placeholderImage);
		const optimizedImage =
			mimetype.startsWith("image") && width ? await sharp(sourceFile).resize(parseInt(width)).toBuffer() : sourceFile;

		response.writeHead(200, {
			"Content-Type": mimetype,
		});

		response.end(optimizedImage);
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const getProducts = async (request, response) => {
	let query = {};

	try {
		const { _id: itemID, page, limit, categoryID, sellerID } = request.query;

		if (!itemID && (!page || !limit)) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		query.isActive = true;

		if (itemID) query._id = itemID;
		if (categoryID) query.categoryID = categoryID;
		if (sellerID) query.sellerID = sellerID;

		const dbPayload = await products
			.find(query, GUESTS_PRODUCTS_IGNORED_FIELDS)
			.limit(limit)
			.skip(page && (page - 1) * limit);

		if (dbPayload.length > 0) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record Found", itemID ? dbPayload[0] : dbPayload);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "No Record Found!", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const getCategories = async (request, response) => {
	let query = {};

	try {
		const { _id: itemID, page, limit } = request.query;

		if (!itemID && (!page || !limit)) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		query.isActive = true;

		const dbPayload = await categories
			.find(query, GUESTS_GENERAL_IGNORED_FIELDS)
			.limit(limit)
			.skip(page && (page - 1) * limit);

		if (dbPayload.length > 0) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record Found", itemID ? dbPayload[0] : dbPayload);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "No Record Found!", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

module.exports = { getMedia, getProducts, getCategories };
