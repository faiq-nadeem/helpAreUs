const express = require("express");
const { jwtAuthentication } = require("../middlewares/authentications/jwtAuthentication.js");

const {
	getProducts,
	createProduct,
	updateProduct,
	deleteProduct,
	getProductReviews,
	createProductReview,
	updateProductReview,
	deleteProductReview,
} = require("../controllers/products.js");
const { userAuthorization } = require("../middlewares/authentications/userAuthorization.js");
const multerMiddleware = require("../middlewares/storage/multerMiddleware.js");

const router = express.Router();

router.get("/", getProducts);
router.post("/", jwtAuthentication, userAuthorization(["admin", "user"]), multerMiddleware(), createProduct);
router.put("/", jwtAuthentication, userAuthorization(["admin", "user"]), multerMiddleware(), updateProduct);
router.delete("/", jwtAuthentication, userAuthorization(["admin", "user"]), deleteProduct);

router.get("/reviews", getProductReviews);
router.post("/reviews", jwtAuthentication, userAuthorization(["admin", "user"]), createProductReview);
router.put("/reviews", jwtAuthentication, userAuthorization(["admin"]), updateProductReview);
router.delete("/reviews", jwtAuthentication, userAuthorization(["admin"]), deleteProductReview);

module.exports = router;
