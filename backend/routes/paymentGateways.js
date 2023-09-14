const express = require("express");
const { jwtAuthentication } = require("../middlewares/authentications/jwtAuthentication.js");

const { userAuthorization } = require("../middlewares/authentications/userAuthorization.js");
const {
	getPaymentGateways,
	createPaymentGateway,
	updatePaymentGateway,
	deletePaymentGateway,
} = require("../controllers/paymentGateways.js");

const router = express.Router();

router.get("/", getPaymentGateways);
router.post("/", jwtAuthentication, userAuthorization(["admin"]), createPaymentGateway);
router.put("/", jwtAuthentication, userAuthorization(["admin"]), updatePaymentGateway);
router.delete("/", jwtAuthentication, userAuthorization(["admin"]), deletePaymentGateway);

module.exports = router;
