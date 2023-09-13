const mongoose = require("mongoose");

const eventBookingSchema = mongoose.Schema(
	{
		userID: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
		description: String,
		location: String,
		eventBudget: { type: Number, default: 0 },
		totalPeople: { type: Number, default: 0 },
		client: {
			name: String,
		},
		schedule: {
			date: Date,
			startTime: Date,
			endTime: Date,
			location: String,
		},
		isActive: { type: Boolean, default: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("eventBookings", eventBookingSchema);
