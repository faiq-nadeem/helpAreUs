const express = require("express");
const { jwtAuthentication } = require("../middlewares/authentications/jwtAuthentication.js");

const {
	getPhotographyTypes,
	createPhotographyType,
	updatePhotographyType,
	deletePhotographyType,
} = require("../controllers/photographyTypes.js");
const { userAuthorization } = require("../middlewares/authentications/userAuthorization.js");

const router = express.Router();

router.get("/", getPhotographyTypes);
router.post("/", jwtAuthentication, userAuthorization(["admin"]), createPhotographyType);
router.put("/", jwtAuthentication, userAuthorization(["admin"]), updatePhotographyType);
router.delete("/", jwtAuthentication, userAuthorization(["admin"]), deletePhotographyType);

module.exports = router;
