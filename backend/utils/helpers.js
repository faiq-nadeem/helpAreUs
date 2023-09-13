var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
var handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const transporter = nodemailer.createTransport(
	smtpTransport({
		host: process.env.SMTP_HOST,
		secure: false,
		port: 587,
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASSWORD,
		},
	})
);

const generateRandomNumber = (numberLength) => {
	return Math.floor(Math.random() * (9 * Math.pow(10, numberLength - 1))) + Math.pow(10, numberLength - 1);
};

const addMinutesToDate = (date, minutes) => {
	return new Date(date.getTime() + minutes * 60000);
};

const Sleep = (time) => {
	return new Promise((resolve) => setTimeout(resolve, time));
};

const sendJsonResponse = (response, httpCode, status = false, message = "No Message To Show!", payload = null) => {
	return response.status(HTTP_STATUS_CODES.OK).json({
		httpCode,
		status,
		message,
		payload,
	});
};

const ConvertMillisecondsToTimeFormat = (milliseconds) => {
	const portions = [];

	const msInHour = 1000 * 60 * 60;
	const hours = Math.trunc(milliseconds / msInHour);
	if (hours > 0) {
		portions.push(hours + "h");
		milliseconds = milliseconds - hours * msInHour;
	}

	const msInMinute = 1000 * 60;
	const minutes = Math.trunc(milliseconds / msInMinute);
	if (minutes > 0) {
		portions.push(minutes + "m");
		milliseconds = milliseconds - minutes * msInMinute;
	}

	const seconds = Math.trunc(milliseconds / 1000);
	if (seconds > 0) {
		portions.push(seconds + "s");
	}

	return portions.join(" ");
};

const convertImageToWebp = async (file) => {
	try {
		const outputBuffer = await sharp(file.buffer).webp({ quality: 90 }).toBuffer();
		if (outputBuffer) {
			file.originalname = path.basename(file.originalname, path.extname(file.originalname)) + ".webp";
			file.mimetype = "image/webp";
		}

		return file;
	} catch (error) {
		throw error;
	}
};

const generateUniqueFileName = (file, filePath) => {
	let fileName = null;
	let isFileAlreadyExists = false;

	do {
		const uniqueFileID = generateRandomNumber(10);
		const currentTimestamp = new Date().toISOString().replace(/[-:.]/g, "");
		const sanitizedFileName = file.originalname
			.split(".")
			.slice(0, -1)
			.join()
			.replace(/[_\s,.]/g, "-");
		const fileExtension = file.originalname.split(".").pop();

		fileName = `${uniqueFileID}-${currentTimestamp}-${sanitizedFileName}.${fileExtension}`;
		isFileAlreadyExists = fs.existsSync(path.join(filePath, fileName));
	} while (isFileAlreadyExists);

	return fileName;
};

const sendPasswordResetVerificationEmail = async (passwordResetLink, receiverEmail, expiresAt) => {
	let emailResponse = null;
	const emailTemplate = fs
		.readFileSync(path.join(__dirname, "/../utils/emailTemplates/passwordResetVerification.html"), "utf-8")
		.toString();

	const template = handlebars.compile(emailTemplate);
	const replacements = {
		passwordResetLink: passwordResetLink,
		expiresAt: ConvertMillisecondsToTimeFormat(expiresAt - new Date()),
	};

	const htmlToSend = template(replacements);

	var mailOptions = {
		from: "passwordReset@Daffi.me",
		to: receiverEmail,
		subject: "Password Reset Verification",
		html: htmlToSend,
	};

	await transporter.sendMail(mailOptions).then((data, error) => {
		if (data) emailResponse = data;
		else emailResponse = error;
	});

	return emailResponse;
};

module.exports = {
	generateRandomNumber,
	addMinutesToDate,
	Sleep,
	sendJsonResponse,
	ConvertMillisecondsToTimeFormat,
	convertImageToWebp,
	generateUniqueFileName,
	sendPasswordResetVerificationEmail,
};
