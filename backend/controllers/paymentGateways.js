const PaymentGateways = require("../models/paymentGateways.js");
const path = require("path");
const fs = require("fs");
const { sendJsonResponse, convertImageToWebp, generateUniqueFileName } = require("../utils/helpers.js");

const filePath = path.join(__dirname, "../assets/images");

const getPaymentGateways = async (request, response) => {
	try {
		const { _id: itemID, page, limit } = request.query;

		if (!itemID && (!page || !limit)) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const dbPayload = await PaymentGateways.find(itemID ? { _id: itemID } : {})
			.limit(limit)
			.skip(page && (page - 1) * limit);

		if (dbPayload.length > 0) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record Found!", itemID ? dbPayload[0] : dbPayload);
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

		console.log(payload);
		const { userID: authenticatingUserID } = request.jwtPayload;
		const files = request.files;

		if (!files.length) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		let file = files[0];

		if (file.mimetype.startsWith("image")) file = await convertImageToWebp(file);

		const generatedFileName = generateUniqueFileName(file, filePath);
		const fileFullPath = path.join(filePath, generatedFileName);

		await fs.promises.writeFile(fileFullPath, file.buffer);

		payload.media = { mimetype: file.mimetype, filename: generatedFileName };

		const dbNewRecordObject = new PaymentGateways({
			...payload,
			createdBy: authenticatingUserID,
			updatedBy: authenticatingUserID,
		});

		const createdPayload = await dbNewRecordObject.save();

		if (createdPayload) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record created::success", createdPayload);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record created::failure", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const updatePaymentGateway = async (request, response) => {
	try {
		const payload = request.body;
		const { userID: authenticatingUserID } = request.jwtPayload;
		const files = request.files;

		if (!payload._id) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const dbPayload = await PaymentGateways.findOne({ _id: payload._id });

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

		const updatedPayload = await PaymentGateways.findOneAndUpdate(
			{ _id: payload._id },
			{ $set: { ...payload, updatedBy: authenticatingUserID } },
			{ new: true },
		);

		if (updatedPayload) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record updated::success", updatedPayload);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record updated::failure", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const deletePaymentGateway = async (request, response) => {
	try {
		const { _id: itemID } = request.query;

		if (!itemID) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const deletedPayload = await PaymentGateways.findOneAndDelete({ _id: itemID }, { new: true });

		if (deletedPayload) {
			if (deletedPayload?.media?.filename) {
				const fileFullPath = path.join(filePath, deletedPayload.media.filename);

				const isfileExists = fs.existsSync(fileFullPath);
				if (isfileExists) await fs.promises.unlink(fileFullPath);
			}

			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record delete::success", deletedPayload);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record delete::failure", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

module.exports = { getPaymentGateways, createPaymentGateway, updatePaymentGateway, deletePaymentGateway };
