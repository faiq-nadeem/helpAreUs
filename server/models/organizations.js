const mongoose = require("mongoose");

const organizationSchema = mongoose.Schema(
	{
		title: String,
		description: String,
		media: { filename: String, mimetype: String },
		isActive: { type: Boolean, default: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
	},
	{ timestamps: true },
);

module.exports = mongoose.model("Organizations", organizationSchema);
