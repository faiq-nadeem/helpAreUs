const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { sendJsonResponse } = require("../../utils/helpers.js");

var publicKEY = fs.readFileSync(path.join(__dirname, "../../assets/encryptionKeys/publicKey.key"), "utf8");

exports.jwtAuthentication = async (request, response, next) => {
	const authHeader = request.headers?.authorization;

	if (authHeader) {
		try {
			const token = authHeader.split(" ")[1];

			jwt.verify(token, publicKEY, LOGIN_TOKEN_PREFERENCES, function (error, data) {
				if (data) {
					request.jwtPayload = data;
					next();
				} else if (error) {
					switch (error.name) {
						case "TokenExpiredError":
							return sendJsonResponse(response, HTTP_STATUS_CODES.INVALID_TOKEN, false, "Login Expired!", error);
							break;
						case "JsonWebTokenError":
							return sendJsonResponse(
								response,
								HTTP_STATUS_CODES.INVALID_TOKEN,
								false,
								"Invalid Authentication Token!",
								error,
							);
							break;
						default:
							return sendJsonResponse(
								response,
								HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
								false,
								"Token cannot be processed",
								error,
							);
							break;
					}
				}
			});
		} catch (error) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Request cannot be processed", null);
		}
	} else {
		return sendJsonResponse(response, HTTP_STATUS_CODES.NOT_ACCEPTABLE, false, "Missing Authentication token", null);
	}
};
