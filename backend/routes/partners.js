const express = require("express");
const { jwtAuthentication } = require("../middlewares/authentications/jwtAuthentication.js");

const { getBanners, createBanner, updateBanner, deleteBanner, getBannerImage } = require("../controllers/banners.js");
const { userAuthorization } = require("../middlewares/authentications/userAuthorization.js");
const multerMiddleware = require("../middlewares/storage/multerMiddleware.js");

const router = express.Router();

router.get("/", getBanners);
router.post("/", jwtAuthentication, userAuthorization(["admin"]), multerMiddleware(), createBanner);
router.put("/", jwtAuthentication, userAuthorization(["admin"]), multerMiddleware(), updateBanner);
router.delete("/", jwtAuthentication, userAuthorization(["admin"]), deleteBanner);

router.get("/image", getBannerImage);

module.exports = router;
