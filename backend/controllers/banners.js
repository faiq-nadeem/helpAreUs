const banners = require("../models/banners.js");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { sendJsonResponse, convertImageToWebp, generateUniqueFileName } = require("../utils/helpers.js");

const placeholderImage = path.join(__dirname, "../assets/images/placeholder.webp");
const filePath = path.join(__dirname, "../assets/images/banners");

const getBanners = async (request, response) => {
	try {
		const { _id: bannerID, page, limit, count } = request.query;

		// Check for missing parameters
		if (!bannerID && (!page || !limit) && !count) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		// If count is available, return the number of records
		if (count) {
			const totalBanners = await banners.count();
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Total Records", totalBanners);
		}

		// Fetch banners based on the provided parameters
		const dbBanners = await banners
			.find(bannerID ? { _id: bannerID } : {})
			.limit(Number(limit))
			.skip(page && (Number(page) - 1) * Number(limit));

		// Send the appropriate response based on the fetched banners
		if (dbBanners.length > 0) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record Found!", bannerID ? dbBanners[0] : dbBanners);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "Record not Found!", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const getBannerImage = async (request, response) => {
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

const createBanner = async (request, response) => {
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

		const banner = new banners({
			...payload,
			createdBy: authenticatingUserID,
			updatedBy: authenticatingUserID,
		});

		const newBanner = await banner.save();

		if (newBanner) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record created::success", newBanner);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record created::failure", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const updateBanner = async (request, response) => {
	try {
		const payload = request.body;
		const { userID: authenticatingUserID } = request.jwtPayload;
		const files = request.files;

		if (!payload._id) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const dbBanner = await banners.findOne({ _id: payload._id });

		if (files.length) {
			for (let file of files) {
				const webpImage = await convertImageToWebp(file);
				const generatedFileName = generateUniqueFileName(webpImage, filePath);

				const fileFullPath = path.join(filePath, generatedFileName);

				const existingFilePath = path.join(filePath, dbBanner[webpImage.fieldname]);
				const isThereExistingFile = fs.existsSync(existingFilePath);
				if (isThereExistingFile) await fs.promises.unlink(existingFilePath);

				await fs.promises.writeFile(fileFullPath, webpImage.buffer);

				payload[file.fieldname] = generatedFileName;
			}
		}

		const updatedBanner = await banners.findOneAndUpdate(
			{ _id: payload._id },
			{ $set: { ...payload, updatedBy: authenticatingUserID } },
			{ new: true }
		);

		if (updatedBanner) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record updated::success", updatedBanner);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record updated::failure", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const deleteBanner = async (request, response) => {
	try {
		const { _id: bannerID } = request.query;

		if (!bannerID) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const deletedBanner = await banners.findOneAndDelete({ _id: bannerID }, { new: true });

		if (deletedBanner) {
			const fileFullPath = path.join(filePath, deletedBanner.featuredImage);

			const isfileExists = fs.existsSync(fileFullPath);
			if (isfileExists) await fs.promises.unlink(fileFullPath);

			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record delete::success", deletedBanner);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record delete::failure", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

module.exports = {
	getBanners,
	getBannerImage,
	createBanner,
	updateBanner,
	deleteBanner,
};
