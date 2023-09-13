const mongoose = require("mongoose");

const chatReportSchema = mongoose.Schema(
	{
		messageID: { type: mongoose.Schema.Types.ObjectId, ref: "chatMessages", required: true },
		reporterID: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
		reason: String,
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("chatReports", chatReportSchema);
