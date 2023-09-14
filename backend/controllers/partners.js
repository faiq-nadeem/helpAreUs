const Partners = require("../models/partners.js");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { sendJsonResponse, convertImageToWebp, generateUniqueFileName } = require("../utils/helpers.js");

const placeholderImage = path.join(__dirname, "../assets/images/placeholder.webp");
const filePath = path.join(__dirname, "../assets/images/partners");

const getPartners = async (request, response) => {
	try {
		const { _id: partnerID, page, limit } = request.query;

		if (!partnerID && (!page || !limit)) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const dbPartners = await Partners.find(partnerID ? { _id: partnerID } : {})
			.limit(limit)
			.skip(page && (page - 1) * limit);

		if (dbPartners.length > 0) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record Found!", partnerID ? dbPartners[0] : dbPartners);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "Record not Found!", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const getPartnerImage = async (request, response) => {
	try {
		const { filename, width } = request.query;

		if (!filename) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const fileFullPath = path.join(filePath, filename);
		const isFileExists = fs.existsSync(fileFullPath);

		const sourceFile = fs.readFileSync(isFileExists ? fileFullPath : placeholderImage);
		const optimizedImage = width ? await sharp(sourceFile).resize(parseInt(width)).toBuffer() : sourceFile;

		response.writeHead(200, {
			"Content-Type": "image/webp",
		});

		response.end(optimizedImage);
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const createPartner = async (request, response) => {
	try {
		const payload = request.body;
		const { userID: authenticatingUserID } = request.jwtPayload;
		const files = request.files;

		if (!files.length) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		for (let file of files) {
			const webpImage = await convertImageToWebp(file);
			const generatedFileName = generateUniqueFileName(webpImage, filePath);

			const fileFullPath = path.join(filePath, generatedFileName);
			payload[file.fieldname] = generatedFileName;

			await fs.promises.writeFile(fileFullPath, webpImage.buffer);
		}

		const partner = new Partners({
			...payload,
			createdBy: authenticatingUserID,
			updatedBy: authenticatingUserID,
		});

		const newPartner = await partner.save();

		if (newPartner) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record created::success", newPartner);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record created::failure", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const updatePartner = async (request, response) => {
	try {
		const payload = request.body;
		const { userID: authenticatingUserID } = request.jwtPayload;
		const files = request.files;

		if (!payload._id) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const dbPartner = await partners.findOne({ _id: payload._id });

		if (files.length) {
			for (let file of files) {
				const webpImage = await convertImageToWebp(file);
				const generatedFileName = generateUniqueFileName(webpImage, filePath);

				const fileFullPath = path.join(filePath, generatedFileName);

				const existingFilePath = path.join(filePath, dbPartner[webpImage.fieldname]);
				const isThereExistingFile = fs.existsSync(existingFilePath);
				if (isThereExistingFile) await fs.promises.unlink(existingFilePath);

				await fs.promises.writeFile(fileFullPath, webpImage.buffer);

				payload[file.fieldname] = generatedFileName;
			}
		}

		const updatedPartner = await Partners.findOneAndUpdate(
			{ _id: payload._id },
			{ $set: { ...payload, updatedBy: authenticatingUserID } },
			{ new: true },
		);

		if (updatedPartner) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record updated::success", updatedPartner);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record updated::failure", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const deletePartner = async (request, response) => {
	try {
		const { _id: partnerID } = request.query;

		if (!partnerID) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const deletedPartner = await Partners.findOneAndDelete({ _id: partnerID }, { new: true });

		if (deletedPartner) {
			const fileFullPath = path.join(filePath, deletedPartner.featuredImage);

			const isfileExists = fs.existsSync(fileFullPath);
			if (isfileExists) await fs.promises.unlink(fileFullPath);

			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record delete::success", deletedPartner);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record delete::failure", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

module.exports = {
	getPartners,
	getPartnerImage,
	createPartner,
	updatePartner,
	deletePartner,
};
