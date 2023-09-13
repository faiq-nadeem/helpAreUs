const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
	{
		title: String,
		price: Number,
		description: String,
		media: [
			{
				filename: String,
				mimetype: String,
			},
		],
		condition: { type: String },
		sellerID: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
		categoryID: { type: mongoose.Schema.Types.ObjectId, ref: "categories" },
		isActive: { type: Boolean, default: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model("products", productSchema);
