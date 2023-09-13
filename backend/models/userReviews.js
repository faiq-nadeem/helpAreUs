const mongoose = require("mongoose");

const userReviewSchema = mongoose.Schema(
	{
		reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
		receiver: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
		rating: { type: Number, min: 1, max: 5 },
		review: String,
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("userReviews", userReviewSchema);
