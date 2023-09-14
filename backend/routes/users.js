const express = require("express");
const { jwtAuthentication } = require("../middlewares/authentications/jwtAuthentication.js");

const {
	getUser,
	login,
	register,
	updateUser,
	updatePassword,
	sendPasswordResetEmail,
	passwordResetUsingVerificationEmail,
	deleteUser,
	getUserImage,
} = require("../controllers/users.js");
const { userAuthorization } = require("../middlewares/authentications/userAuthorization.js");
const multerMiddleware = require("../middlewares/storage/multerMiddleware.js");

const router = express.Router();

router.get("/", jwtAuthentication, userAuthorization(["admin", "user", "photographer"]), getUser);
router.post("/", register);
router.put("/", jwtAuthentication, userAuthorization(["admin", "user", "photographer"]), multerMiddleware(), updateUser);
router.delete("/", jwtAuthentication, userAuthorization(["admin", "user", "photographer"]), deleteUser);

router.post("/password", jwtAuthentication, userAuthorization(["admin", "user", "photographer"]), updatePassword);
router.patch("/password", passwordResetUsingVerificationEmail);

router.get("/image", getUserImage);
router.post("/login", login);
router.post("/send-password-reset-email", sendPasswordResetEmail);

module.exports = router;
