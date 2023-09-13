const express = require("express");
const { jwtAuthentication } = require("../middlewares/authentications/jwtAuthentication.js");
const { userAuthorization } = require("../middlewares/authentications/userAuthorization.js");
const multerMiddleware = require("../middlewares/storage/multerMiddleware.js");

const {
	getChat,
	getChatGroups,
	getChatGroupImage,
	createChatGroup,
	updateChatGroup,
	deleteChatGroup,
} = require("../controllers/chats.js");

const router = express.Router();

router.get("/chat", getChat);

router.get("/groups", getChatGroups);
router.post("/groups", jwtAuthentication, userAuthorization(["admin", "photographer"]), multerMiddleware(), createChatGroup);
router.put("/groups", jwtAuthentication, userAuthorization(["admin", "photographer"]), multerMiddleware(), updateChatGroup);
router.delete("/groups", jwtAuthentication, userAuthorization(["admin", "photographer"]), deleteChatGroup);
router.get("/groups/image", getChatGroupImage);

module.exports = router;
