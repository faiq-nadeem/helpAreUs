const Orders = require("../models/orders.js");
const { sendJsonResponse } = require("../utils/helpers.js");

const getOrders = async (request, response) => {
	try {
		const { _id: orderID, page, limit, count } = request.query;

		// Check for missing parameters
		if (!orderID && (!page || !limit) && !count) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		// If count is available, return the number of records
		if (count) {
			const totalOrders = await Orders.count();
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Total Records", totalOrders);
		}

		// Fetch orders based on the provided parameters
		const dbOrders = await orders
			.find(orderID ? { _id: orderID } : {})
			.limit(Number(limit))
			.skip(page && (Number(page) - 1) * Number(limit));

		// Send the appropriate response based on the fetched orders
		if (dbOrders.length > 0) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record Found!", orderID ? dbOrders[0] : dbOrders);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "Record not Found!", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const createOrder = async (request, response) => {
	try {
		const payload = request.body;
		const { userID: authenticatingUserID } = request.jwtPayload;

		if (!payload?.item?.length) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const order = new orders({
			...payload,
			createdBy: authenticatingUserID,
			updatedBy: authenticatingUserID,
		});

		const newOrder = await Orders.save();

		if (newOrder) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record created::success", newOrder);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record created::failure", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const updateOrder = async (request, response) => {
	try {
		const payload = request.body;
		const { userID: authenticatingUserID } = request.jwtPayload;

		if (!payload._id) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const updatedOrder = await Orders.findOneAndUpdate(
			{ _id: payload._id },
			{ $set: { ...payload, updatedBy: authenticatingUserID } },
			{ new: true },
		);

		if (updatedOrder) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record updated::success", updatedOrder);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record updated::failure", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const deleteOrder = async (request, response) => {
	try {
		const { _id: orderID } = request.query;

		if (!orderID) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const deletedOrder = await Orders.findOneAndDelete({ _id: orderID }, { new: true });

		if (deletedOrder) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record delete::success", deletedOrder);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record delete::failure", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

module.exports = {
	getOrders,
	createOrder,
	updateOrder,
	deleteOrder,
};
