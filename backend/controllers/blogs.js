const blogs = require("../models/blogs.js");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { sendJsonResponse, convertImageToWebp, generateUniqueFileName } = require("../utils/helpers.js");

const placeholderImage = path.join(__dirname, "../assets/images/placeholder.webp");
const filePath = path.join(__dirname, "../assets/images/blogs");

const getBlogs = async (request, response) => {
	try {
		const { _id: blogID, page, limit } = request.query;

		if (!blogID && (!page || !limit)) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const dbBlogs = await blogs
			.find(blogID ? { _id: blogID } : {})
			.limit(limit)
			.skip(page && (page - 1) * limit);

		if (dbBlogs.length > 0) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record Found!", blogID ? dbBlogs[0] : dbBlogs);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "Record not Found!", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const getBlogImage = async (request, response) => {
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

const createBlog = async (request, response) => {
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

		const blog = new blogs({
			...payload,
			createdBy: authenticatingUserID,
			updatedBy: authenticatingUserID,
		});

		const newBlog = await blog.save();

		if (newBlog) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record created::success", newBlog);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record created::failure", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const updateBlog = async (request, response) => {
	try {
		const payload = request.body;
		const { userID: authenticatingUserID } = request.jwtPayload;
		const files = request.files;

		if (!payload._id) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const dbBlog = await blogs.findOne({ _id: payload._id });

		if (files.length) {
			for (let file of files) {
				const webpImage = await convertImageToWebp(file);
				const generatedFileName = generateUniqueFileName(webpImage, filePath);

				const fileFullPath = path.join(filePath, generatedFileName);

				const existingFilePath = path.join(filePath, dbBlog[webpImage.fieldname]);
				const isThereExistingFile = fs.existsSync(existingFilePath);
				if (isThereExistingFile) await fs.promises.unlink(existingFilePath);

				await fs.promises.writeFile(fileFullPath, webpImage.buffer);

				payload[file.fieldname] = generatedFileName;
			}
		}

		const updatedBlog = await blogs.findOneAndUpdate(
			{ _id: payload._id },
			{ $set: { ...payload, updatedBy: authenticatingUserID } },
			{ new: true }
		);

		if (updatedBlog) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record updated::success", updatedBlog);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record updated::failure", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const deleteBlog = async (request, response) => {
	try {
		const { _id: blogID } = request.query;

		if (!blogID) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const deletedBlog = await blogs.findOneAndDelete({ _id: blogID }, { new: true });

		if (deletedBlog) {
			const fileFullPath = path.join(filePath, deletedBlog.featuredImage);

			const isfileExists = fs.existsSync(fileFullPath);
			if (isfileExists) await fs.promises.unlink(fileFullPath);

			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record delete::success", deletedBlog);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record delete::failure", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

module.exports = {
	getBlogs,
	getBlogImage,
	createBlog,
	updateBlog,
	deleteBlog,
};
