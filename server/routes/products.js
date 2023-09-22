const express = require("express");
const { jwtAuthentication } = require("../middlewares/authentications/jwtAuthentication.js");

const { getProducts, createProduct, updateProduct, deleteProduct } = require("../controllers/products.js");
const { userAuthorization } = require("../middlewares/authentications/userAuthorization.js");
const multerMiddleware = require("../middlewares/storage/multerMiddleware.js");

const router = express.Router();

router.get("/", getProducts);
router.post("/", jwtAuthentication, userAuthorization(["admin", "photographer"]), multerMiddleware(), createProduct);
router.put("/", jwtAuthentication, userAuthorization(["admin", "photographer"]), multerMiddleware(), updateProduct);
router.delete("/", jwtAuthentication, userAuthorization(["admin", "photographer"]), deleteProduct);

module.exports = router;
