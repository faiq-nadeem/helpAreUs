const Projects = require("../models/projects.js");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { sendJsonResponse, convertImageToWebp, generateUniqueFileName } = require("../utils/helpers.js");

const placeholderImage = path.join(__dirname, "../assets/images/placeholder.webp");
const filePath = path.join(__dirname, "../assets/images/projects");

const getProjects = async (request, response) => {
	try {
		const { _id: projectID, page, limit } = request.query;

		if (!projectID && (!page || !limit)) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const dbProjects = await Projects.find(projectID ? { _id: projectID } : {})
			.limit(limit)
			.skip(page && (page - 1) * limit);

		if (dbProjects.length > 0) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record Found!", projectID ? dbProjects[0] : dbProjects);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "Record not Found!", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const getProjectImage = async (request, response) => {
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

const createProject = async (request, response) => {
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

		const project = new Projects({
			...payload,
			createdBy: authenticatingUserID,
			updatedBy: authenticatingUserID,
		});

		const newProject = await project.save();

		if (newProject) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record created::success", newProject);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record created::failure", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const updateProject = async (request, response) => {
	try {
		const payload = request.body;
		const { userID: authenticatingUserID } = request.jwtPayload;
		const files = request.files;

		if (!payload._id) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const dbProject = await projects.findOne({ _id: payload._id });

		if (files.length) {
			for (let file of files) {
				const webpImage = await convertImageToWebp(file);
				const generatedFileName = generateUniqueFileName(webpImage, filePath);

				const fileFullPath = path.join(filePath, generatedFileName);

				const existingFilePath = path.join(filePath, dbProject[webpImage.fieldname]);
				const isThereExistingFile = fs.existsSync(existingFilePath);
				if (isThereExistingFile) await fs.promises.unlink(existingFilePath);

				await fs.promises.writeFile(fileFullPath, webpImage.buffer);

				payload[file.fieldname] = generatedFileName;
			}
		}

		const updatedProject = await Projects.findOneAndUpdate(
			{ _id: payload._id },
			{ $set: { ...payload, updatedBy: authenticatingUserID } },
			{ new: true },
		);

		if (updatedProject) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record updated::success", updatedProject);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record updated::failure", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const deleteProject = async (request, response) => {
	try {
		const { _id: projectID } = request.query;

		if (!projectID) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const deletedProject = await Projects.findOneAndDelete({ _id: projectID }, { new: true });

		if (deletedProject) {
			const fileFullPath = path.join(filePath, deletedProject.featuredImage);

			const isfileExists = fs.existsSync(fileFullPath);
			if (isfileExists) await fs.promises.unlink(fileFullPath);

			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record delete::success", deletedProject);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Record delete::failure", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

module.exports = {
	getProjects,
	getProjectImage,
	createProject,
	updateProject,
	deleteProject,
};
