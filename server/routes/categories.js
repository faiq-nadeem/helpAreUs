const express = require("express");
const { jwtAuthentication } = require("../middlewares/authentications/jwtAuthentication.js");

const { createCategory, updateCategory, deleteCategory, getCategories } = require("../controllers/categories.js");
const { userAuthorization } = require("../middlewares/authentications/userAuthorization.js");
const multerMiddleware = require("../middlewares/storage/multerMiddleware.js");

const router = express.Router();

router.get("/", getCategories);
router.post("/", jwtAuthentication, userAuthorization(["admin"]), multerMiddleware(), createCategory);
router.put("/", jwtAuthentication, userAuthorization(["admin"]), multerMiddleware(), updateCategory);
router.delete("/", jwtAuthentication, userAuthorization(["admin"]), deleteCategory);

module.exports = router;
