const express = require("express");
const { jwtAuthentication } = require("../middlewares/authentications/jwtAuthentication.js");

const { getBlogs, createBlog, updateBlog, deleteBlog, getBlogImage } = require("../controllers/blogs.js");
const { userAuthorization } = require("../middlewares/authentications/userAuthorization.js");
const multerMiddleware = require("../middlewares/storage/multerMiddleware.js");

const router = express.Router();

router.get("/", getBlogs);
router.post("/", jwtAuthentication, userAuthorization(["admin"]), multerMiddleware(), createBlog);
router.put("/", jwtAuthentication, userAuthorization(["admin"]), multerMiddleware(), updateBlog);
router.delete("/", jwtAuthentication, userAuthorization(["admin"]), deleteBlog);

router.get("/image", getBlogImage);

module.exports = router;
