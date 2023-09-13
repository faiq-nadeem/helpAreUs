const express = require("express");
const {
	getPhotographers,
	getPhotographerClientPackages,
	getPhotographerEventBookings,
	getPhotographerPortfolios,
	getProducts,
	getCategories,
	getPhotographyTypes,
	getSubscriptions,
	getBlogs,
	getTestimonials,
	getBanners,
} = require("../controllers/guest.js");

const router = express.Router();

router.get("/photographers", getPhotographers);
router.get("/photographers/client-packages", getPhotographerClientPackages);
router.get("/photographers/event-bookings", getPhotographerEventBookings);
router.get("/photographers/portfolios", getPhotographerPortfolios);
router.get("/products", getProducts);
router.get("/categories", getCategories);
router.get("/photography-types", getPhotographyTypes);
router.get("/subscriptions", getSubscriptions);
router.get("/blogs", getBlogs);
router.get("/testimonials", getTestimonials);
router.get("/banners", getBanners);

module.exports = router;
