const mongoose = require("mongoose");

const chatGroupSchema = mongoose.Schema(
	{
		title: { type: String, required: true },
		description: String,
		members: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
		admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
		media: {
			mimetype: String,
			filename: String,
		},
		groupType: { type: String, default: "private", enum: ["private", "public"] },
		createdBy: String,
		updateBy: String,
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("chatGroups", chatGroupSchema);
