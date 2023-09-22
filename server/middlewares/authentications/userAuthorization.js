const { sendJsonResponse } = require("../../utils/helpers.js");

exports.userAuthorization = (allowedRoles) => {
	return (request, response, next) => {
		const userRole = request.jwtPayload.userRole; // Extract user's role from the request body

		if (userRole && allowedRoles.includes(userRole)) {
			next(); // User has the required role, proceed to the route handler
		} else {
			return sendJsonResponse(
				response,
				HTTP_STATUS_CODES.UNAUTHORIZED,
				false,
				"Access denied. Insufficient privileges!",
				null
			);
		}
	};
};
