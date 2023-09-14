global.LOGIN_TOKEN_PREFERENCES = {
	expiresIn: "24h",
	algorithm: "RS256",
};

global.HTTP_STATUS_CODES = {
	OK: 200,
	CREATED: 201,
	NO_CONTENT: 204,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	NOTFOUND: 404,
	NOT_ACCEPTABLE: 406,
	CONFLICT: 409,
	GONE: 410,
	UNPROCESSABLE_ENTITY: 422,
	INVALID_TOKEN: 498,
	INTERNAL_SERVER_ERROR: 500,
};

global.EXPRESS_RATE_LIMIT = {
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 1000, // limit each IP to 100 requests per windowMs
};

global.USER_FIELDS_UPDATE_BY_ADMIN_ONLY = ["passwordReset", "userRole", "isActive", "createdBy", "updatedBy"];

global.GUESTS_PRODUCTS_IGNORED_FIELDS = {
	isActive: 0,
	createdBy: 0,
	updatedBy: 0,
};

global.GUESTS_GENERAL_IGNORED_FIELDS = {
	isActive: 0,
	createdBy: 0,
	updatedBy: 0,
	createdAt: 0,
	updatedAt: 0,
};
