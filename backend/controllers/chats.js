const chatMessages = require("../models/chatMessages");

const chatGroups = require("../models/chatGroups.js");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { sendJsonResponse, convertImageToWebp, generateUniqueFileName } = require("../utils/helpers.js");
const users = require("../models/users.js");

const placeholderImage = path.join(__dirname, "../assets/images/placeholder.webp");
const filePath = path.join(__dirname, "../assets/images/chatGroups");

const getChat = async (request, response) => {
	let query = {};

	try {
		const { senderID, receiverID, groupID, message, page, limit } = request.query;

		if (!senderID && !receiverID && !groupID && !message && (!page || !limit)) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Invalid parameters!", null);
		}

		if (senderID) query.sender = senderID;
		if (receiverID) query.receiver = receiverID;
		if (groupID) query.group = groupID;
		if (message) query.message = new RegExp(message, "i");

		const dbChatMessages = await chatMessages
			.find(query)
			.limit(limit)
			.skip(page && (page - 1) * limit);

		if (dbChatMessages.length) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record Found!", dbChatMessages);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "Record not Found!", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const saveAndSendMessage = async (io, socket, message) => {
	try {
		const chatMessage = new chatMessages({
			message: message?.content,
			sender: message?.sender?._id,
			group: message?.groupID,
			receiver: message?.receiver?._id,
		});

		const newChatMessage = await chatMessage.save();

		if (newChatMessage) {
			io.emit("receive-message", message);
		} else {
		}
	} catch (error) {}
};

const getChatGroups = async (request, response) => {
	let query = {};

	try {
		const { _id: chatGroupID, page, limit, userID, includePublicGroups } = request.query;

		if (!chatGroupID && (!page || !limit || (!userID && !includePublicGroups))) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		if (chatGroupID) {
			query._id = chatGroupID;
		} else if (includePublicGroups && userID) {
			query.$or = [{ groupType: "public" }, { members: userID }, { admins: userID }];
		} else if (userID) {
			query.$or = [{ members: userID }, { admins: userID }];
			// query.members = { $elemMatch: { userID: userID } };
		} else if (includePublicGroups) {
			query.groupType = "public";
		}

		const dbChatGroups = await chatGroups
			.find(query)
			.limit(limit)
			.skip(page && (page - 1) * limit);

		if (dbChatGroups.length) {
			return sendJsonResponse(
				response,
				HTTP_STATUS_CODES.OK,
				true,
				"Record Found!",
				chatGroupID ? dbChatGroups[0] : dbChatGroups,
			);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "Record not Found!", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const getChatGroupImage = async (request, response) => {
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

const createChatGroup = async (request, response) => {
	try {
		const payload = request.body;
		const { userID: authenticatingUserID } = request.jwtPayload;
		const files = request.files;

		if (!payload?.title || !payload?.members?.length) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		if (files?.length) {
			let file = files[0];
			if (file.mimetype.startsWith("image")) file = await convertImageToWebp(file);

			const generatedFileName = generateUniqueFileName(file, filePath);
			const fileFullPath = path.join(filePath, generatedFileName);

			await fs.promises.writeFile(fileFullPath, file.buffer);
			payload.media = { mimetype: file.mimetype, filename: generatedFileName };
		}

		payload.members = Array.isArray(payload.members) ? payload.members : JSON.parse(payload.members);

		const adminID = payload.members.includes(authenticatingUserID) ? authenticatingUserID : payload.members[0];
		payload.admins = [adminID];
		payload.members = payload.members.filter((member) => member !== adminID);

		const chatGroup = new chatGroups({
			...payload,
			createdBy: authenticatingUserID,
			updatedBy: authenticatingUserID,
		});

		const newChatGroup = await chatGroup.save();

		if (newChatGroup) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record created::success", newChatGroup);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record created::failure", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const updateChatGroup = async (request, response) => {
	try {
		const payload = request.body;
		const { userID: authenticatingUserID } = request.jwtPayload;
		const files = request.files;

		if (!payload._id) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const authenticatingDBUser = await users.findOne({ _id: authenticatingUserID });

		if (payload?.userID === authenticatingUserID || authenticatingDBUser?.userRole === "admin") {
			const dbChatGroup = await chatGroups.findOne({ _id: payload._id });

			if (files.length) {
				let file = files[0];
				if (file.mimetype.startsWith("image")) file = await convertImageToWebp(file);

				const generatedFileName = generateUniqueFileName(file, filePath);
				const fileFullPath = path.join(filePath, generatedFileName);

				await fs.promises.writeFile(fileFullPath, file.buffer);

				payload.media = { mimetype: file.mimetype, filename: generatedFileName };
			}

			const updatedChatGroup = await chatGroups.findOneAndUpdate(
				{ _id: payload._id },
				{ $set: { ...payload, updatedBy: authenticatingUserID } },
				{ new: true },
			);

			if (updatedChatGroup) {
				if (dbChatGroup?.media?.filename) {
					const existingFilePath = path.join(filePath, dbChatGroup.media.filename);
					const isThereExistingFile = fs.existsSync(existingFilePath);

					if (isThereExistingFile) await fs.promises.unlink(existingFilePath);
				}

				return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record updated::success", updatedChatGroup);
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

const deleteChatGroup = async (request, response) => {
	try {
		const { _id: chatGroupID } = request.query;
		const { userID: authenticatingUserID } = request.jwtPayload;

		if (!chatGroupID) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const authenticatingDBUser = await users.findOne({ _id: authenticatingUserID });
		const dbChatGroup = await chatGroups.findOne({ _id: chatGroupID });

		if (dbChatGroup?.userID.toString() === authenticatingUserID || authenticatingDBUser?.userRole === "admin") {
			const deletedChatGroup = await chatGroups.findOneAndDelete({ _id: chatGroupID }, { new: true });

			if (deletedChatGroup) {
				if (deletedChatGroup?.media?.filename) {
					const fileFullPath = path.join(filePath, dbChatGroup.media.filename);
					if (fs.existsSync(fileFullPath)) await fs.promises.unlink(fileFullPath);
				}

				return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record delete::success", deletedChatGroup);
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
	getChat,
	saveAndSendMessage,
	getChatGroups,
	getChatGroupImage,
	createChatGroup,
	updateChatGroup,
	deleteChatGroup,
};
