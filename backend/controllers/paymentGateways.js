const PaymentGateways = require("../models/paymentGateways.js");
const users = require("../models/users.js");
const { sendJsonResponse } = require("../utils/helpers.js");

const getPaymentGateways = async (request, response) => {
	let query = {};

	try {
		const { _id: paymentGatewayID, page, limit, userID } = request.query;

		if (!paymentGatewayID && (!page || !limit || !userID)) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		if (paymentGatewayID) query._id = paymentGatewayID;
		if (userID) query.userID = userID;

		const dbPaymentGateways = await PaymentGateways.find(query)
			.limit(limit)
			.skip(page && (page - 1) * limit);

		if (dbPaymentGateways.length > 0) {
			return sendJsonResponse(
				response,
				HTTP_STATUS_CODES.OK,
				true,
				"Record Found!",
				paymentGatewayID ? dbPaymentGateways[0] : dbPaymentGateways,
			);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "Record not Found!", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const createPaymentGateway = async (request, response) => {
	try {
		const payload = request.body;
		const { userID: authenticatingUserID } = request.jwtPayload;

		if (!payload.userID || !payload.schedule.date) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const authenticatingDBUser = await users.findOne({ _id: authenticatingUserID });

		if (payload?.userID === authenticatingUserID || authenticatingDBUser?.userRole === "admin") {
			const paymentGateway = new PaymentGateways({
				...payload,
				createdBy: authenticatingUserID,
				updatedBy: authenticatingUserID,
			});

			const newPaymentGateway = await paymentGateway.save();

			if (newPaymentGateway) {
				return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record created::success", newPaymentGateway);
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

const updatePaymentGateway = async (request, response) => {
	try {
		const payload = request.body;
		const { userID: authenticatingUserID } = request.jwtPayload;

		if (!payload._id || !payload?.userID) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const authenticatingDBUser = await PaymentGateways.findOne({ _id: authenticatingUserID });

		if (payload?.userID === authenticatingUserID || authenticatingDBUser?.userRole === "admin") {
			const updatedPaymentGateway = await paymentGateways.findOneAndUpdate(
				{ _id: payload._id },
				{ $set: { ...payload, updatedBy: authenticatingUserID } },
				{ new: true },
			);

			if (updatedPaymentGateway) {
				return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record updated::success", updatedPaymentGateway);
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

const deletePaymentGateway = async (request, response) => {
	try {
		const { _id: paymentGatewayID } = request.query;
		const { userID: authenticatingUserID } = request.jwtPayload;

		if (!paymentGatewayID) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const authenticatingDBUser = await users.findOne({ _id: authenticatingUserID });
		const dbPaymentGateway = await PaymentGateways.findOne({ _id: paymentGatewayID });

		if (dbPaymentGateway.userID.toString() === authenticatingUserID || authenticatingDBUser.userRole === "admin") {
			const deletedPaymentGateway = await paymentGateways.findOneAndDelete({ _id: paymentGatewayID }, { new: true });

			if (deletedPaymentGateway) {
				return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record delete::success", deletedPaymentGateway);
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
	getPaymentGateways,
	createPaymentGateway,
	updatePaymentGateway,
	deletePaymentGateway,
};
