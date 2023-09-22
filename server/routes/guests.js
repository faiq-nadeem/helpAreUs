const express = require("express");
const { getProducts, getCategories, getMedia } = require("../controllers/guest.js");

const router = express.Router();

router.get("/media", getMedia);
router.get("/products", getProducts);
router.get("/categories", getCategories);

module.exports = router;
