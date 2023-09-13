const mongoose = require("mongoose");

const clientPackageSchema = mongoose.Schema(
	{
		userID: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
		title: String,
		price: Number,
		features: {
			totalImages: Number,
			totalPeople: Number,
			sessionTime: String,
			extra: [String],
		},
		isActive: { type: Boolean, default: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("clientPackages", clientPackageSchema);
