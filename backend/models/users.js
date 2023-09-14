const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
	{
		firstName: String,
		lastName: String,
		phone: { type: String, unique: true },
		email: String,
		country: String,
		city: String,
		state: String,
		address: String,
		bio: String,
		password: String,
		media: { filename: String, mimeType: String },
		socialMedia: {
			tiktok: String,
			instagram: String,
			facebook: String,
			twitter: String,
			linkedin: String,
			youtube: String,
		},
		passwordReset: {
			count: { type: Number, default: 0 },
			code: { type: Number, default: null },
			lastResetDate: Date,
			expiresAt: Date,
		},
		userRole: { type: String, default: "user" },
		isActive: { type: Boolean, default: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model("Users", userSchema);
