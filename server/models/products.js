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
		stock: { quantity: { type: Number, default: 0 } },
		isFeatured: { type: Boolean, default: false },
		partners: [{ type: mongoose.Schema.Types.ObjectId, ref: "Partners" }],
		projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Projects" }],
		category: { type: mongoose.Schema.Types.ObjectId, ref: "Categories" },
		isActive: { type: Boolean, default: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
	},
	{ timestamps: true },
);

module.exports = mongoose.model("Products", productSchema);
