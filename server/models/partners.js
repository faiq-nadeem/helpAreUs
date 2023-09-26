const mongoose = require("mongoose");

const partnerSchema = mongoose.Schema(
	{
		title: String,
		description: String,
		website: String,
		email: String,
		phone: String,
		address: String,
		media: { filename: String, mimetype: String },
		organizations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Organizations" }],
		projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Projects" }],
		isActive: { type: Boolean, default: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
	},
	{ timestamps: true },
);

module.exports = mongoose.model("Partners", partnerSchema);
