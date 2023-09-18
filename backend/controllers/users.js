const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const users = require("../models/users.js");
const {
	generateRandomNumber,
	addMinutesToDate,
	sendPasswordResetVerificationEmail,
	sendJsonResponse,
	convertImageToWebp,
	generateUniqueFileName,
} = require("../utils/helpers.js");

var privateKEY = fs.readFileSync(path.join(__dirname, "../assets/encryptionKeys/privateKey.key"), "utf8");
var publicKEY = fs.readFileSync(path.join(__dirname, "../assets/encryptionKeys/publicKey.key"), "utf8");

const filePath = path.join(__dirname, "../assets/images");

const getUser = async (request, response) => {
	let query = {};

	try {
		const { userID, page, limit } = request.query;
		const { userID: authenticatingUserID } = request.jwtPayload;

		const authenticatingDBUser = await users.findOne({ _id: authenticatingUserID }, { password: 0 });

		if (!userID && (!page || !limit)) {
			if (authenticatingDBUser)
				return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record Found", authenticatingDBUser);
			else return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "No Record Found!", null);
		}

		if (authenticatingDBUser?.userRole === "admin" || userID === authenticatingUserID) {
			if (userID) query._id = userID;

			const dbPayload = await users
				.find(query, { password: 0 })
				.limit(limit)
				.skip(page && (page - 1) * limit);

			if (dbPayload.length > 0) {
				return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record Found", userID ? dbPayload[0] : dbPayload);
			} else {
				return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "No Record Found!", null);
			}
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.UNAUTHORIZED, false, "Access denied!", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const register = async (request, response) => {
	const payload = request.body;

	if (!payload?.phone || !payload?.password) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
	}

	try {
		USER_FIELDS_UPDATE_BY_ADMIN_ONLY.forEach((key) => delete payload[key]);

		const dbPayload = await users.findOne({ phone: payload?.phone });

		if (dbPayload) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.CONFLICT, false, "Record Already Exists!", null);
		} else {
			const hashedPassword = await bcrypt.hash(payload?.password, 12);

			const user = new users({
				...payload,
				password: hashedPassword,
			});

			user.createdBy = payload?.createdBy || user["_id"];
			user.updatedBy = payload?.updatedBy || user["_id"];

			const newUser = await user.save();

			if (newUser) {
				return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record created::success", newUser);
			} else {
				return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record created::failure", null);
			}
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const login = async (request, response) => {
	const { phone, password, isAdminLogin } = request.body;

	if (!phone || !password) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
	}

	try {
		const dbPayload = await users.findOne({ phone: phone });

		if (dbPayload) {
			if ((isAdminLogin && dbPayload?.userRole === "admin") || (!isAdminLogin && dbPayload?.userRole !== "admin")) {
				const isPasswordMatched = await bcrypt.compare(password, dbPayload.password);

				if (isPasswordMatched) {
					var token = jwt.sign(
						{
							username: dbPayload.username,
							phone: dbPayload.phone,
							userID: dbPayload._id,
							userRole: dbPayload.userRole,
							userStatus: dbPayload.userStatus,
						},
						privateKEY,
						LOGIN_TOKEN_PREFERENCES,
					);

					if (token) {
						return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Login::success", { token: token });
					} else {
						return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Login::failure", null);
					}
				} else {
					return sendJsonResponse(response, HTTP_STATUS_CODES.UNAUTHORIZED, false, "Invalid Password!", null);
				}
			} else {
				return sendJsonResponse(response, HTTP_STATUS_CODES.UNAUTHORIZED, false, "Access denied!", null);
			}
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "No Record Found!", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const updateUser = async (request, response) => {
	try {
		const { password, ...payload } = request.body;
		const { userID: authenticatingUserID } = request.jwtPayload;
		const files = request.files;

		if (!payload?._id) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const authenticatingDBUser = await users.findOne({ _id: authenticatingUserID });

		if (authenticatingDBUser?.userRole !== "admin") USER_FIELDS_UPDATE_BY_ADMIN_ONLY.forEach((key) => delete payload[key]);

		if (payload._id === authenticatingUserID || authenticatingDBUser?.userRole === "admin") {
			const dbPayload = await users.findOne({ _id: payload._id });

			if (files.length) {
				let file = files[0];

				if (file.mimetype.startsWith("image")) file = await convertImageToWebp(file);

				const generatedFileName = generateUniqueFileName(file, filePath);
				const fileFullPath = path.join(filePath, generatedFileName);

				if (dbPayload?.media?.filename) {
					const existingFilePath = path.join(filePath, dbPayload.media.filename);

					const isThereExistingFile = fs.existsSync(existingFilePath);
					if (isThereExistingFile) await fs.promises.unlink(existingFilePath);
				}

				await fs.promises.writeFile(fileFullPath, file.buffer);

				payload.media = { mimetype: file.mimetype, filename: generatedFileName };
			}

			const updatedUser = await users.findOneAndUpdate(
				{ _id: payload._id },
				{
					$set: {
						...payload,
						updatedBy: authenticatingUserID,
					},
				},
				{ fields: { password: 0 }, new: true },
			);

			if (updatedUser) {
				return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record updated::success", updatedUser);
			} else {
				return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record updated::failure", null);
			}
		} else {
			return sendJsonResponse(
				response,
				HTTP_STATUS_CODES.UNAUTHORIZED,
				false,
				"Access denied. Insufficient privileges!",
				null,
			);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const updatePassword = async (request, response) => {
	try {
		const { _id: userID, oldPassword: oldPassword, newPassword: newPassword } = request.body;
		const { userID: authenticatingUserID } = request.jwtPayload;

		if (!userID || !oldPassword || !newPassword) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		if (userID === authenticatingUserID) {
			const dbPayload = await users.findOne({ _id: userID });

			if (dbPayload) {
				const isPasswordMatched = await bcrypt.compare(oldPassword, dbPayload.password);

				if (isPasswordMatched) {
					const hashedPassword = await bcrypt.hash(newPassword, 12);

					const updatedUser = await users.findOneAndUpdate(
						{ _id: userID },
						{
							$set: {
								password: hashedPassword,
								updatedBy: authenticatingUserID,
							},
						},
						{ fields: { password: 0 }, new: true },
					);

					if (updatedUser) {
						return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record updated::success", updatedUser);
					} else {
						return sendJsonResponse(
							response,
							HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
							false,
							"Record updated::failure",
							null,
						);
					}
				} else {
					return sendJsonResponse(response, HTTP_STATUS_CODES.CONFLICT, false, "Password Verification::failure", null);
				}
			}
		} else {
			return sendJsonResponse(
				response,
				HTTP_STATUS_CODES.UNAUTHORIZED,
				false,
				"Access denied. Insufficient privileges!",
				null,
			);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const sendPasswordResetEmail = async (request, response) => {
	const { email } = request.body;

	if (!email) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
	}

	try {
		const oneTimeCode = generateRandomNumber(6);
		const expiresAt = addMinutesToDate(new Date(), 100);
		const dbPayload = await users.findOne({ email: email }, { password: 0 });

		if (dbPayload?._id) {
			const updatedUser = await users.findOneAndUpdate(
				{ _id: dbPayload._id },
				{
					passwordReset: {
						count: dbPayload?.passwordReset?.count + 1 || 1,
						code: oneTimeCode,
						expiresAt: expiresAt,
					},
				},
				{ new: true },
			);

			if (updatedUser) {
				var token = jwt.sign({ email: email, userID: dbPayload._id, code: oneTimeCode }, privateKEY, LOGIN_TOKEN_PREFERENCES);

				const emailSent = await sendPasswordResetVerificationEmail(
					process.env.ADMIN_PANEL_URL + `/reset-password?passwordReset=true&&token=${token}`,
					dbPayload.email,
					expiresAt,
				);

				if (emailSent) {
					return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Email sent::success", emailSent);
				} else {
					return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Email sent::Failure", null);
				}
			} else {
				return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Password Request::failure", null);
			}
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "No Record Found!", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const passwordResetUsingVerificationEmail = async (request, response) => {
	const { token, password } = request.body;

	if (!token && !password) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
	}

	try {
		const decodedToken = jwt.verify(token, publicKEY, LOGIN_TOKEN_PREFERENCES);

		const dbPayload = await users.findOne({ email: decodedToken.email, _id: decodedToken.userID }, { password: 0 });

		if (dbPayload) {
			if (dbPayload?.passwordReset?.expiresAt > new Date()) {
				if (dbPayload?.passwordReset?.code === decodedToken.code) {
					const hashedPassword = await bcrypt.hash(password, 12);

					const updatedUser = await users.findOneAndUpdate(
						{ _id: dbPayload._id },
						{
							password: hashedPassword,
							"passwordReset.code": null,
							"passwordReset.lastResetDate": new Date(),
							"passwordReset.expiresAt": null,
						},
						{ fields: { password: 0 }, new: true },
					);
					if (updatedUser) {
						return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Password Reset::success", updatedUser);
					} else {
						return sendJsonResponse(
							response,
							HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
							false,
							"Password reset::failure",
							null,
						);
					}
				} else return sendJsonResponse(response, HTTP_STATUS_CODES.CONFLICT, false, "Email Verification::failure", null);
			} else {
				return sendJsonResponse(response, HTTP_STATUS_CODES.GONE, false, "Password reset Link Expired", null);
			}
		} else return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "No Record Found!", null);
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const deleteUser = async (request, response) => {
	try {
		const { _id: userID } = request.query;
		const { userID: authenticatingUserID } = request.jwtPayload;

		if (!userID) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}
		const authenticatingDBUser = await users.findOne({ _id: authenticatingUserID });

		if (userID === authenticatingUserID || authenticatingDBUser?.userRole === "admin") {
			const deletedUser = await users.findOneAndDelete({ _id: userID }, { new: true });

			if (deletedUser) {
				if (deletedUser?.media?.filename) {
					const fileFullPath = path.join(filePath, deletedUser.media.filename);

					const isfileExists = fs.existsSync(fileFullPath);
					if (isfileExists) await fs.promises.unlink(fileFullPath);
				}

				return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record delete::success", deletedUser);
			} else {
				return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record delete::failure", null);
			}
		} else {
			return sendJsonResponse(
				response,
				HTTP_STATUS_CODES.UNAUTHORIZED,
				false,
				"Access denied. Insufficient privileges!",
				null,
			);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

module.exports = {
	getUser,
	login,
	register,
	updateUser,
	updatePassword,
	sendPasswordResetEmail,
	passwordResetUsingVerificationEmail,
	deleteUser,
};
