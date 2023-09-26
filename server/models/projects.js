const mongoose = require("mongoose");

const subscriptionSchema = mongoose.Schema(
	{
		title: String,
		description: String,
		email: String,
		phone: String,
		address: String,
		media: { filename: String, mimetype: String },
		organizations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Organizations" }],
		partners: [{ type: mongoose.Schema.Types.ObjectId, ref: "Partners" }],
		isActive: { type: Boolean, default: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
	},
	{ timestamps: true },
);

module.exports = mongoose.model("subscriptions", subscriptionSchema);
