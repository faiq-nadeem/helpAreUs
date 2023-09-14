const bcrypt = require("bcrypt");
const Users = require("../models/users");
const sampleUsersData = require("../utils/sampleDBMigrations/users.json");
const { sendJsonResponse } = require("../utils/helpers");

const installSampleDB = async (request, response) => {
	try {
		// Loop through the sampleMigrationsData and insert each user into the database
		for (const userData of sampleUsersData) {
			userData.password = await bcrypt.hash(userData.password, 12);

			await Users.create(userData);
		}

		return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record Created::success", null);
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

module.exports = {
	installSampleDB,
};
