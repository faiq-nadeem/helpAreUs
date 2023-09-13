const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
	{
		email: { type: String, unique: true },
		firstName: String,
		lastName: String,
		phone: String,
		country: String,
		company: String,
		town: String,
		address: String,
		city: String,
		state: String,
		postalCode: String,
		website: String,
		bio: String,
		password: String,
		profileImage: String,
		startingCost: { type: Number, default: 0 },
		reviews: {
			given: [{ type: mongoose.Schema.Types.ObjectId, ref: "userReviews" }],
			received: [{ type: mongoose.Schema.Types.ObjectId, ref: "userReviews" }],
		},
		photographer: {
			equipment: String,
			photographyTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: "photographyTypes" }],
			showBookingCalendar: { type: Boolean, default: true },
		},
		socialMedia: {
			tiktok: String,
			instagram: String,
			facebook: String,
			twitter: String,
			linkedin: String,
			youtube: String,
		},
		reviewPlatform: {
			google: String,
			facebook: String,
			yelp: String,
			tripadvisor: String,
		},
		subscription: {
			subscriptionPlanID: { type: mongoose.Schema.Types.ObjectId, ref: "subscriptions" },
			subscriptionPaymentID: String,
			activationDate: Date,
			expiryDate: Date,
			duration: { type: String, default: "month" },
			paymentType: [String],
			paymentStatus: { type: String, default: "unpaid" },
			isActive: { type: Boolean, default: false },
			isActiveByAdmin: { type: Boolean, default: false },
			cancelation: {
				status: { type: Boolean, default: false },
				date: Date,
				reason: String,
			},
		},
		passwordReset: {
			count: { type: Number, default: 0 },
			code: { type: Number, default: null },
			lastResetDate: Date,
			expiresAt: Date,
		},
		userRole: { type: String, default: "user" },
		isActive: { type: Boolean, default: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("users", userSchema);
