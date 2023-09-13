const mongoose = require("mongoose");

const chatMessageSchema = mongoose.Schema(
	{
		message: { type: String, required: true },
		sender: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
		group: { type: mongoose.Schema.Types.ObjectId, ref: "chatGroups" },
		receiver: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
		edited: { status: { type: Boolean, default: false }, date: Date },
		deleted: { status: { type: Boolean, default: false }, date: Date },
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("chatMessages", chatMessageSchema);
