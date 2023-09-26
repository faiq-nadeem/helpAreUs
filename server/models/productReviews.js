const mongoose = require("mongoose");

const productReviewSchema = mongoose.Schema(
	{
		reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
		product: { type: mongoose.Schema.Types.ObjectId, ref: "Products" },
		rating: { type: Number, min: 1, max: 5 },
		message: String,
		isApproved: { type: Boolean, default: false },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
	},
	{ timestamps: true },
);

module.exports = mongoose.model("ProductReviews", productReviewSchema);
