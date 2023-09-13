const photographyTypes = require("../models/photographyTypes.js");
const { sendJsonResponse } = require("../utils/helpers.js");

const getPhotographyTypes = async (request, response) => {
	try {
		const { _id: photographyTypeID, page, limit } = request.query;

		if (!photographyTypeID && (!page || !limit)) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const dbPhotographyTypes = await photographyTypes
			.find(photographyTypeID ? { _id: photographyTypeID } : {})
			.limit(limit)
			.skip(page && (page - 1) * limit);

		if (dbPhotographyTypes.length > 0) {
			return sendJsonResponse(
				response,
				HTTP_STATUS_CODES.OK,
				true,
				"Record Found!",
				photographyTypeID ? dbPhotographyTypes[0] : dbPhotographyTypes
			);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "Record not Found!", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const createPhotographyType = async (request, response) => {
	try {
		const payload = request.body;
		const { userID: authenticatingUserID } = request.jwtPayload;

		if (!payload.title) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const photographyType = new photographyTypes({
			...payload,
			createdBy: authenticatingUserID,
			updatedBy: authenticatingUserID,
		});

		const newPhotographyType = await photographyType.save();

		if (newPhotographyType) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record created::success", newPhotographyType);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record created::failure", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const updatePhotographyType = async (request, response) => {
	try {
		const payload = request.body;
		const { userID: authenticatingUserID } = request.jwtPayload;

		if (!payload._id) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const updatedPhotographyType = await photographyTypes.findOneAndUpdate(
			{ _id: payload._id },
			{ $set: { ...payload, updatedBy: authenticatingUserID } },
			{ new: true }
		);

		if (updatedPhotographyType) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record updated::success", updatedPhotographyType);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record updated::failure", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const deletePhotographyType = async (request, response) => {
	try {
		const { _id: photographyTypeID } = request.query;

		if (!photographyTypeID) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const deletedPhotographyType = await photographyTypes.findOneAndDelete({ _id: photographyTypeID }, { new: true });

		if (deletedPhotographyType) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record delete::success", deletedPhotographyType);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record delete::failure", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

module.exports = {
	getPhotographyTypes,
	createPhotographyType,
	updatePhotographyType,
	deletePhotographyType,
};
