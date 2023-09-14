const express = require("express");
const { jwtAuthentication } = require("../middlewares/authentications/jwtAuthentication.js");

const { userAuthorization } = require("../middlewares/authentications/userAuthorization.js");
const { getOrders, createOrder, updateOrder, deleteOrder } = require("../controllers/orders.js");

const router = express.Router();

router.get("/", getOrders);
router.post("/", createOrder);
router.put("/", jwtAuthentication, userAuthorization(["admin"]), updateOrder);
router.delete("/", jwtAuthentication, userAuthorization(["admin"]), deleteOrder);

module.exports = router;
