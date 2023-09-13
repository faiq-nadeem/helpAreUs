const eventBookings = require("../models/eventBookings.js");
const users = require("../models/users.js");
const { sendJsonResponse } = require("../utils/helpers.js");

const getEventBookings = async (request, response) => {
	let query = {};

	try {
		const { _id: eventBookingID, page, limit, userID } = request.query;

		if (!eventBookingID && (!page || !limit || !userID)) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		if (eventBookingID) query._id = eventBookingID;
		if (userID) query.userID = userID;

		const dbEventBookings = await eventBookings
			.find(query)
			.limit(limit)
			.skip(page && (page - 1) * limit);

		if (dbEventBookings.length > 0) {
			return sendJsonResponse(
				response,
				HTTP_STATUS_CODES.OK,
				true,
				"Record Found!",
				eventBookingID ? dbEventBookings[0] : dbEventBookings
			);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "Record not Found!", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const createEventBooking = async (request, response) => {
	try {
		const payload = request.body;
		const { userID: authenticatingUserID } = request.jwtPayload;

		if (!payload.userID || !payload.schedule.date) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const authenticatingDBUser = await users.findOne({ _id: authenticatingUserID });

		if (payload?.userID === authenticatingUserID || authenticatingDBUser?.userRole === "admin") {
			const eventBooking = new eventBookings({
				...payload,
				createdBy: authenticatingUserID,
				updatedBy: authenticatingUserID,
			});

			const newEventBooking = await eventBooking.save();

			if (newEventBooking) {
				return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record created::success", newEventBooking);
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

const updateEventBooking = async (request, response) => {
	try {
		const payload = request.body;
		const { userID: authenticatingUserID } = request.jwtPayload;

		if (!payload._id || !payload?.userID) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const authenticatingDBUser = await users.findOne({ _id: authenticatingUserID });

		if (payload?.userID === authenticatingUserID || authenticatingDBUser?.userRole === "admin") {
			const updatedEventBooking = await eventBookings.findOneAndUpdate(
				{ _id: payload._id },
				{ $set: { ...payload, updatedBy: authenticatingUserID } },
				{ new: true }
			);

			if (updatedEventBooking) {
				return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record updated::success", updatedEventBooking);
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

const deleteEventBooking = async (request, response) => {
	try {
		const { _id: eventBookingID } = request.query;
		const { userID: authenticatingUserID } = request.jwtPayload;

		if (!eventBookingID) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const authenticatingDBUser = await users.findOne({ _id: authenticatingUserID });
		const dbEventBooking = await eventBookings.findOne({ _id: eventBookingID });

		if (dbEventBooking.userID.toString() === authenticatingUserID || authenticatingDBUser.userRole === "admin") {
			const deletedEventBooking = await eventBookings.findOneAndDelete({ _id: eventBookingID }, { new: true });

			if (deletedEventBooking) {
				return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record delete::success", deletedEventBooking);
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
	getEventBookings,
	createEventBooking,
	updateEventBooking,
	deleteEventBooking,
};
