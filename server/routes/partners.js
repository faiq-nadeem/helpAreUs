const express = require("express");
const { jwtAuthentication } = require("../middlewares/authentications/jwtAuthentication.js");
const { userAuthorization } = require("../middlewares/authentications/userAuthorization.js");
const multerMiddleware = require("../middlewares/storage/multerMiddleware.js");
const { getPartners, createPartner, updatePartner, deletePartner } = require("../controllers/partners.js");

const router = express.Router();

router.get("/", getPartners);
router.post("/", jwtAuthentication, userAuthorization(["admin"]), multerMiddleware(), createPartner);
router.put("/", jwtAuthentication, userAuthorization(["admin"]), multerMiddleware(), updatePartner);
router.delete("/", jwtAuthentication, userAuthorization(["admin"]), deletePartner);

module.exports = router;
