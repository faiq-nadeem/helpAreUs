const mongoose = require("mongoose");

const subscriptionSchema = mongoose.Schema(
	{
		title: String,
		description: String,
		organizationCategory: { type: mongoose.Schema.Types.ObjectId, ref: "OrganizationCategories" },
		email: String,
		phone: String,
		address: String,
		media: { filename: String, mimetype: String },
		partners: [{ type: mongoose.Schema.Types.ObjectId, ref: "Partners" }],
		isActive: { type: Boolean, default: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model("subscriptions", subscriptionSchema);
