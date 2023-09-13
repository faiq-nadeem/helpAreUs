const testimonials = require("../models/testimonials.js");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { sendJsonResponse, convertImageToWebp, generateUniqueFileName } = require("../utils/helpers.js");

const placeholderImage = path.join(__dirname, "../assets/images/placeholder.webp");
const filePath = path.join(__dirname, "../assets/images/testimonials");

const getTestimonials = async (request, response) => {
	try {
		const { _id: testimonialID, page, limit } = request.query;

		if (!testimonialID && (!page || !limit)) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const dbTestimonials = await testimonials
			.find(testimonialID ? { _id: testimonialID } : {})
			.limit(limit)
			.skip(page && (page - 1) * limit);

		if (dbTestimonials.length > 0) {
			return sendJsonResponse(
				response,
				HTTP_STATUS_CODES.OK,
				true,
				"Record Found!",
				testimonialID ? dbTestimonials[0] : dbTestimonials
			);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "Record not Found!", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const getTestimonialImage = async (request, response) => {
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

const createTestimonial = async (request, response) => {
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

		const testimonial = new testimonials({
			...payload,
			createdBy: authenticatingUserID,
			updatedBy: authenticatingUserID,
		});

		const newTestimonial = await testimonial.save();

		if (newTestimonial) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record created::success", newTestimonial);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record created::failure", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const updateTestimonial = async (request, response) => {
	try {
		const payload = request.body;
		const { userID: authenticatingUserID } = request.jwtPayload;
		const files = request.files;

		if (!payload._id) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const dbTestimonial = await testimonials.findOne({ _id: payload._id });

		if (files.length) {
			for (let file of files) {
				const webpImage = await convertImageToWebp(file);
				const generatedFileName = generateUniqueFileName(webpImage, filePath);

				const fileFullPath = path.join(filePath, generatedFileName);

				const existingFilePath = path.join(filePath, dbTestimonial[webpImage.fieldname]);
				const isThereExistingFile = fs.existsSync(existingFilePath);
				if (isThereExistingFile) await fs.promises.unlink(existingFilePath);

				await fs.promises.writeFile(fileFullPath, webpImage.buffer);

				payload[file.fieldname] = generatedFileName;
			}
		}

		const updatedTestimonial = await testimonials.findOneAndUpdate(
			{ _id: payload._id },
			{ $set: { ...payload, updatedBy: authenticatingUserID } },
			{ new: true }
		);

		if (updatedTestimonial) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record updated::success", updatedTestimonial);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record updated::failure", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const deleteTestimonial = async (request, response) => {
	try {
		const { _id: testimonialID } = request.query;

		if (!testimonialID) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const deletedTestimonial = await testimonials.findOneAndDelete({ _id: testimonialID }, { new: true });

		if (deletedTestimonial) {
			const fileFullPath = path.join(filePath, deletedTestimonial.featuredImage);

			const isfileExists = fs.existsSync(fileFullPath);
			if (isfileExists) await fs.promises.unlink(fileFullPath);

			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record delete::success", deletedTestimonial);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record delete::failure", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

module.exports = {
	getTestimonials,
	getTestimonialImage,
	createTestimonial,
	updateTestimonial,
	deleteTestimonial,
};
