const products = require("../models/products.js");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { sendJsonResponse, convertImageToWebp, generateUniqueFileName } = require("../utils/helpers.js");
const users = require("../models/users.js");

const placeholderImage = path.join(__dirname, "../assets/images/placeholder.webp");
const filePath = path.join(__dirname, "../assets/images/products");

const getProducts = async (request, response) => {
	try {
		const { _id: productID, page, limit } = request.query;

		if (!productID && (!page || !limit)) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const dbProducts = await products
			.find(productID ? { _id: productID } : {})
			.limit(limit)
			.skip(page && (page - 1) * limit);

		if (dbProducts.length > 0) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record Found!", productID ? dbProducts[0] : dbProducts);
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "Record not Found!", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const getProductImage = async (request, response) => {
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

const createProduct = async (request, response) => {
	let media = [];

	try {
		const payload = request.body;
		const { userID: authenticatingUserID } = request.jwtPayload;
		const files = request.files;

		if (!files.length || !payload?.title || !payload?.price || !payload?.categoryID) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const authenticatingDBUser = await users.findOne({ _id: authenticatingUserID });

		if (payload?.sellerID === authenticatingUserID || authenticatingDBUser?.userRole === "admin") {
			for (let file of files) {
				if (file.mimetype.startsWith("image")) file = await convertImageToWebp(file);

				const generatedFileName = generateUniqueFileName(file, filePath);
				const fileFullPath = path.join(filePath, generatedFileName);

				await fs.promises.writeFile(fileFullPath, file.buffer);
				media.push({ mimetype: file.mimetype, filename: generatedFileName });
			}

			payload.media = media;

			const product = new products({
				...payload,
				sellerID: payload?.sellerID || authenticatingUserID,
				createdBy: authenticatingUserID,
				updatedBy: authenticatingUserID,
			});

			const newProduct = await product.save();

			if (newProduct) {
				return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record created::success", newProduct);
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

const updateProduct = async (request, response) => {
	let media = [];

	try {
		const payload = request.body;
		const { userID: authenticatingUserID } = request.jwtPayload;
		const files = request.files;

		if (!payload._id) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const authenticatingDBUser = await users.findOne({ _id: authenticatingUserID });

		if (payload?.sellerID === authenticatingUserID || authenticatingDBUser?.userRole === "admin") {
			const dbProduct = await products.findOne({ _id: payload._id });

			if (files.length) {
				for (let file of files) {
					if (file.mimetype.startsWith("image")) file = await convertImageToWebp(file);

					const generatedFileName = generateUniqueFileName(file, filePath);
					const fileFullPath = path.join(filePath, generatedFileName);

					await fs.promises.writeFile(fileFullPath, file.buffer);

					media.push({ mimetype: file.mimetype, filename: generatedFileName });
				}

				payload.media = media;
			}

			const updatedProduct = await products.findOneAndUpdate(
				{ _id: payload._id },
				{ $set: { ...payload, updatedBy: authenticatingUserID } },
				{ new: true },
			);

			if (updatedProduct) {
				if (dbProduct?.media?.length) {
					for (let media of dbProduct.media) {
						const existingFilePath = path.join(filePath, media.filename);
						const isThereExistingFile = fs.existsSync(existingFilePath);

						if (isThereExistingFile) await fs.promises.unlink(existingFilePath);
					}
				}

				return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record updated::success", updatedProduct);
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

const deleteProduct = async (request, response) => {
	try {
		const { _id: productID } = request.query;
		const { userID: authenticatingUserID } = request.jwtPayload;

		if (!productID) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		const authenticatingDBUser = await users.findOne({ _id: authenticatingUserID });
		const dbProduct = await products.findOne({ _id: productID });

		if (dbProduct.sellerID.toString() === authenticatingUserID || authenticatingDBUser.userRole === "admin") {
			const deletedProduct = await products.findOneAndDelete({ _id: productID }, { new: true });

			if (deletedProduct) {
				if (deletedProduct?.media?.length) {
					for (let media of deletedProduct.media) {
						const existingFilePath = path.join(filePath, media.filename);
						const isThereExistingFile = fs.existsSync(existingFilePath);

						if (isThereExistingFile) await fs.promises.unlink(existingFilePath);
					}
				}

				return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record delete::success", deletedProduct);
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
	getProducts,
	getProductImage,
	createProduct,
	updateProduct,
	deleteProduct,
};
