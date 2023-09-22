const express = require("express");
const { jwtAuthentication } = require("../middlewares/authentications/jwtAuthentication.js");

const {
	createOrganization,
	updateOrganization,
	deleteOrganization,
	getOrganizations,
} = require("../controllers/organizations.js");
const { userAuthorization } = require("../middlewares/authentications/userAuthorization.js");
const multerMiddleware = require("../middlewares/storage/multerMiddleware.js");

const router = express.Router();

router.get("/", getOrganizations);
router.post("/", jwtAuthentication, userAuthorization(["admin"]), multerMiddleware(), createOrganization);
router.put("/", jwtAuthentication, userAuthorization(["admin"]), multerMiddleware(), updateOrganization);
router.delete("/", jwtAuthentication, userAuthorization(["admin"]), deleteOrganization);

module.exports = router;
