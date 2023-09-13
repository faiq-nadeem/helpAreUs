const mongoose = require("mongoose");

const userPortfolioSchema = mongoose.Schema(
	{
		userID: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
		title: String,
		description: String,
		media: {
			mimetype: String,
			filename: String,
		},
		isActive: { type: Boolean, default: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("userPortfolios", userPortfolioSchema);
