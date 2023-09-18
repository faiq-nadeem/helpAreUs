const express = require("express");
const { jwtAuthentication } = require("../middlewares/authentications/jwtAuthentication.js");

const { userAuthorization } = require("../middlewares/authentications/userAuthorization.js");
const {
	getPaymentGateways,
	createPaymentGateway,
	updatePaymentGateway,
	deletePaymentGateway,
} = require("../controllers/paymentGateways.js");
const multerMiddleware = require("../middlewares/storage/multerMiddleware.js");

const router = express.Router();

router.get("/", getPaymentGateways);
router.post("/", jwtAuthentication, userAuthorization(["admin"]), multerMiddleware(), createPaymentGateway);
router.put("/", jwtAuthentication, userAuthorization(["admin"]), multerMiddleware(), updatePaymentGateway);
router.delete("/", jwtAuthentication, userAuthorization(["admin"]), deletePaymentGateway);

module.exports = router;
