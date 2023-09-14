const mongoose = require("mongoose");

const categorySchema = mongoose.Schema(
	{
		title: String,
		description: String,
		media: { filename: String, mimeType: String },
		isActive: { type: Boolean, default: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model("Categories", categorySchema);
