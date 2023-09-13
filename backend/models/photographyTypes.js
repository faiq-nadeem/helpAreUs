const mongoose = require("mongoose");

const photographyTypeSchema = mongoose.Schema(
	{
		title: String,
		description: String,
		isActive: { type: Boolean, default: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("photographyTypes", photographyTypeSchema);
