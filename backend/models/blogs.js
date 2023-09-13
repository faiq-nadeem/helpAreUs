const mongoose = require("mongoose");

const blogSchema = mongoose.Schema(
	{
		title: String,
		description: String,
		featuredImage: String,
		isActive: { type: Boolean, default: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("blogs", blogSchema);
