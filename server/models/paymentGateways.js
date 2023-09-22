const mongoose = require("mongoose");

const paymentGatewaySchema = mongoose.Schema(
	{
		title: { type: String, required: true },
		description: String,
		media: {
			mimetype: String,
			filename: String,
		},
		isActive: { type: Boolean, default: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model("PaymentGateways", paymentGatewaySchema);
