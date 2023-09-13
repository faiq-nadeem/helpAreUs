const mongoose = require("mongoose");

const subscriptionSchema = mongoose.Schema(
	{
		title: { type: String, required: true },
		price: { type: Number, default: 0, min: 0 },
		color: { type: String, default: "#d53627" },
		description: String,
		yearlyDiscount: { type: Number, default: 0, min: 0 },
		features: {
			emailLink: { type: Boolean, default: false },
			phoneLink: { type: Boolean, default: false },
			websiteLink: { type: Boolean, default: false },
			socialMediaLinks: { type: Boolean, default: false },
			calendar: { type: Boolean, default: false },
			chat: { type: Boolean, default: false },
			store: { type: Boolean, default: false },
			clientPackages: { type: Boolean, default: false },
		},
		portfolio: {
			maxImagesAllowed: { type: Number, default: 0, min: 0 },
		},
		stripePriceKeys: {
			year: String,
			month: String,
		},
		isActive: { type: Boolean, default: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("subscriptions", subscriptionSchema);
