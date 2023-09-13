const { sendJsonResponse } = require("../utils/helpers");

const users = require("../models/users");
const clientPackages = require("../models/clientPackages");
const eventBookings = require("../models/eventBookings");
const userPortfolios = require("../models/userPortfolios");
const products = require("../models/products");
const categories = require("../models/categories");
const photographyTypes = require("../models/photographyTypes");
const subscriptions = require("../models/subscriptions");
const blogs = require("../models/blogs");
const testimonials = require("../models/testimonials");
const banners = require("../models/banners");

const getPhotographers = async (request, response) => {
	let query = {};

	try {
		const { _id: itemID, page, limit, name, state, city, postalCode, photographyTypeID } = request.query;

		if (!itemID && (!page || !limit)) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		query.isActive = true;
		query.userRole = "photographer";

		if (itemID) query._id = itemID;
		if (photographyTypeID) query["photographer.photographyTypes"] = photographyTypeID;
		if (state) query.state = new RegExp(state, "i");
		if (city) query.city = new RegExp(city, "i");
		if (postalCode) query.postalCode = new RegExp(postalCode, "i");
		if (name) {
			query.$or = [{ firstName: new RegExp(name, "i") }, { lastName: new RegExp(name, "i") }];
		}

		const dbPayload = await users
			.find(query, GUESTS_PHOTOGRAPHERS_IGNORED_FIELDS)
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

const getPhotographerClientPackages = async (request, response) => {
	let query = {};

	try {
		const { userID, page, limit } = request.query;

		if (!userID || !page || !limit) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		if (userID) query.userID = userID;

		const dbPayload = await clientPackages
			.find(query, { createdBy: 0, updatedBy: 0, isActive: 0 })
			.limit(limit)
			.skip(page && (page - 1) * limit);

		if (dbPayload.length > 0) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record Found!", dbPayload);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "Record not Found!", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const getPhotographerEventBookings = async (request, response) => {
	let query = {};

	try {
		const { userID, page, limit } = request.query;

		if (!userID || !page || !limit) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const dbPayload = await users.findOne({ _id: userID });

		if (dbPayload?.photographer?.showBookingCalendar) {
			if (userID) query.userID = userID;
			query.isActive = true;

			const dbEventBookings = await eventBookings
				.find(query, { createdBy: 0, updatedBy: 0, isActive: 0 })
				.limit(limit)
				.skip(page && (page - 1) * limit);

			if (dbEventBookings.length > 0) {
				return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record Found!", dbEventBookings);
			} else {
				return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "Record not Found!", null);
			}
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.NO_CONTENT, false, "Record is hidden!", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const getPhotographerPortfolios = async (request, response) => {
	let query = {};

	try {
		const { userID, page, limit, mediaType } = request.query;

		if (!page || !limit || !userID) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		if (mediaType === "image") {
			query["media.mimetype"] = { $regex: /^image\// };
		} else if (mediaType === "video") {
			query["media.mimetype"] = { $regex: /^video\// };
		}

		if (userID) query.userID = userID;

		const dbPayload = await userPortfolios
			.find(query)
			.limit(limit)
			.skip(page && (page - 1) * limit);

		if (dbPayload.length > 0) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record Found!", dbPayload);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "Record not Found!", null);
		}
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

const getPhotographyTypes = async (request, response) => {
	let query = {};

	try {
		const { _id: itemID, page, limit } = request.query;

		if (!itemID && (!page || !limit)) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		query.isActive = true;

		const dbPayload = await photographyTypes
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

const getSubscriptions = async (request, response) => {
	let query = {};

	try {
		const { _id: itemID, page, limit } = request.query;

		if (!itemID && (!page || !limit)) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		query.isActive = true;

		const dbPayload = await subscriptions
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

const getBlogs = async (request, response) => {
	let query = {};

	try {
		const { _id: itemID, page, limit } = request.query;

		if (!itemID && (!page || !limit)) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		query.isActive = true;

		const dbPayload = await blogs
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

const getTestimonials = async (request, response) => {
	let query = {};

	try {
		const { _id: itemID, page, limit } = request.query;

		if (!itemID && (!page || !limit)) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		query.isActive = true;

		const dbPayload = await testimonials
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

const getBanners = async (request, response) => {
	let query = {};

	try {
		const { _id: itemID, page, limit } = request.query;

		if (!itemID && (!page || !limit)) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		query.isActive = true;

		const dbPayload = await banners
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

module.exports = {
	getPhotographers,
	getPhotographerClientPackages,
	getPhotographerEventBookings,
	getPhotographerPortfolios,
	getProducts,
	getCategories,
	getPhotographyTypes,
	getSubscriptions,
	getBlogs,
	getTestimonials,
	getBanners,
};
