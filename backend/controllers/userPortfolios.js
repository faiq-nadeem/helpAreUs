const userPortfolios = require("../models/userPortfolios.js");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { sendJsonResponse, convertImageToWebp, generateUniqueFileName } = require("../utils/helpers.js");
const users = require("../models/users.js");

const placeholderImage = path.join(__dirname, "../assets/images/placeholder.webp");
const filePath = path.join(__dirname, "../assets/images/userPortfolios");

const getUserPortfolios = async (request, response) => {
	let query = {};

	try {
		const { _id: userPortfolioID, page, limit, userID, mediaType } = request.query;

		if (!userPortfolioID && (!page || !limit || !userID)) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		if (mediaType === "image") {
			query["media.mimetype"] = { $regex: /^image\// };
		} else if (mediaType === "video") {
			query["media.mimetype"] = { $regex: /^video\// };
		}

		if (userPortfolioID) query._id = userPortfolioID;
		if (userID) query.userID = userID;

		const dbUserPortfolios = await userPortfolios
			.find(query)
			.limit(limit)
			.skip(page && (page - 1) * limit);

		if (dbUserPortfolios.length > 0) {
			return sendJsonResponse(
				response,
				HTTP_STATUS_CODES.OK,
				true,
				"Record Found!",
				userPortfolioID ? dbUserPortfolios[0] : dbUserPortfolios
			);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "Record not Found!", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const getUserPortfolioImage = async (request, response) => {
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

const createUserPortfolio = async (request, response) => {
	let portfolios = [];

	try {
		const payload = request.body;
		const { userID: authenticatingUserID } = request.jwtPayload;
		const files = request.files;

		if (!files.length || !payload?.userID) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const authenticatingDBUser = await users.findOne({ _id: authenticatingUserID });

		if (payload?.userID === authenticatingUserID || authenticatingDBUser?.userRole === "admin") {
			for (let file of files) {
				if (file.mimetype.startsWith("image")) file = await convertImageToWebp(file);

				const generatedFileName = generateUniqueFileName(file, filePath);
				const fileFullPath = path.join(filePath, generatedFileName);

				await fs.promises.writeFile(fileFullPath, file.buffer);
				payload.media = { mimetype: file.mimetype, filename: generatedFileName };

				portfolios.push({
					...payload,
					userID: payload?.userID || authenticatingUserID,
					createdBy: authenticatingUserID,
					updatedBy: authenticatingUserID,
				});
			}

			const newUserPortfolios = await userPortfolios.insertMany(portfolios, { ordered: true });

			if (newUserPortfolios) {
				return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record created::success", newUserPortfolios);
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

const updateUserPortfolio = async (request, response) => {
	try {
		const payload = request.body;
		const { userID: authenticatingUserID } = request.jwtPayload;
		const files = request.files;

		if (!payload._id) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const authenticatingDBUser = await users.findOne({ _id: authenticatingUserID });

		if (payload?.userID === authenticatingUserID || authenticatingDBUser?.userRole === "admin") {
			const dbUserPortfolio = await userPortfolios.findOne({ _id: payload._id });

			if (files.length) {
				let file = files[0];
				if (file.mimetype.startsWith("image")) file = await convertImageToWebp(file);

				const generatedFileName = generateUniqueFileName(file, filePath);
				const fileFullPath = path.join(filePath, generatedFileName);

				await fs.promises.writeFile(fileFullPath, file.buffer);

				payload.media = { mimetype: file.mimetype, filename: generatedFileName };
			}

			const updatedUserPortfolio = await userPortfolios.findOneAndUpdate(
				{ _id: payload._id },
				{ $set: { ...payload, updatedBy: authenticatingUserID } },
				{ new: true }
			);

			if (updatedUserPortfolio) {
				if (dbUserPortfolio?.media?.filename) {
					const existingFilePath = path.join(filePath, dbUserPortfolio.media.filename);
					const isThereExistingFile = fs.existsSync(existingFilePath);

					if (isThereExistingFile) await fs.promises.unlink(existingFilePath);
				}

				return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record updated::success", updatedUserPortfolio);
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

const deleteUserPortfolio = async (request, response) => {
	try {
		const { _id: userPortfolioID } = request.query;
		const { userID: authenticatingUserID } = request.jwtPayload;

		if (!userPortfolioID) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const authenticatingDBUser = await users.findOne({ _id: authenticatingUserID });
		const dbUserPortfolio = await userPortfolios.findOne({ _id: userPortfolioID });

		if (dbUserPortfolio?.userID.toString() === authenticatingUserID || authenticatingDBUser?.userRole === "admin") {
			const deletedUserPortfolio = await userPortfolios.findOneAndDelete({ _id: userPortfolioID }, { new: true });

			if (deletedUserPortfolio) {
				if (deletedUserPortfolio?.media?.filename) {
					const fileFullPath = path.join(filePath, dbUserPortfolio.media.filename);
					if (fs.existsSync(fileFullPath)) await fs.promises.unlink(fileFullPath);
				}

				return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record delete::success", deletedUserPortfolio);
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
	getUserPortfolios,
	getUserPortfolioImage,
	createUserPortfolio,
	updateUserPortfolio,
	deleteUserPortfolio,
};
