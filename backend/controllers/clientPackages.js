const clientPackages = require("../models/clientPackages.js");
const users = require("../models/users.js");
const { sendJsonResponse } = require("../utils/helpers.js");

const getClientPackages = async (request, response) => {
	let query = {};

	try {
		const { _id: clientPackageID, page, limit, userID } = request.query;

		if (!clientPackageID && (!page || !limit || !userID)) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		if (clientPackageID) query._id = userPortfolioID;
		if (userID) query.userID = userID;

		const dbClientPackages = await clientPackages
			.find(query)
			.limit(limit)
			.skip(page && (page - 1) * limit);

		if (dbClientPackages.length > 0) {
			return sendJsonResponse(
				response,
				HTTP_STATUS_CODES.OK,
				true,
				"Record Found!",
				clientPackageID ? dbClientPackages[0] : dbClientPackages
			);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "Record not Found!", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const createClientPackage = async (request, response) => {
	try {
		const payload = request.body;
		const { userID: authenticatingUserID } = request.jwtPayload;

		if (!payload.userID || !payload.title || !payload.price) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const authenticatingDBUser = await users.findOne({ _id: authenticatingUserID });

		if (payload?.userID === authenticatingUserID || authenticatingDBUser?.userRole === "admin") {
			const clientPackage = new clientPackages({
				...payload,
				createdBy: authenticatingUserID,
				updatedBy: authenticatingUserID,
			});

			const newClientPackage = await clientPackage.save();

			if (newClientPackage) {
				return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record created::success", newClientPackage);
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

const updateClientPackage = async (request, response) => {
	try {
		const payload = request.body;
		const { userID: authenticatingUserID } = request.jwtPayload;

		if (!payload._id || !payload?.userID) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const authenticatingDBUser = await users.findOne({ _id: authenticatingUserID });

		if (payload?.userID === authenticatingUserID || authenticatingDBUser?.userRole === "admin") {
			const updatedClientPackage = await clientPackages.findOneAndUpdate(
				{ _id: payload._id },
				{ $set: { ...payload, updatedBy: authenticatingUserID } },
				{ new: true }
			);

			if (updatedClientPackage) {
				return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record updated::success", updatedClientPackage);
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

const deleteClientPackage = async (request, response) => {
	try {
		const { _id: clientPackageID } = request.query;
		const { userID: authenticatingUserID } = request.jwtPayload;

		if (!clientPackageID) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const authenticatingDBUser = await users.findOne({ _id: authenticatingUserID });
		const dbClientPackage = await clientPackages.findOne({ _id: clientPackageID });

		if (dbClientPackage.userID.toString() === authenticatingUserID || authenticatingDBUser.userRole === "admin") {
			const deletedClientPackage = await clientPackages.findOneAndDelete({ _id: clientPackageID }, { new: true });

			if (deletedClientPackage) {
				return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record delete::success", deletedClientPackage);
			} else {
				return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record delete::failure", null);
			}
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.UNAUTHORIZED, false, "Permission denied!", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

module.exports = {
	getClientPackages,
	createClientPackage,
	updateClientPackage,
	deleteClientPackage,
};
