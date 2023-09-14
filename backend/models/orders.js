const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
	{
		orderID: String,
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
		items: [
			{
				partnerID: { type: mongoose.Schema.Types.ObjectId, ref: "Partners" },
				productId: { type: mongoose.Schema.Types.ObjectId, ref: "Products" },
				quantity: Number,
				price: Number,
			},
		],
		totalAmount: Number,
		notes: String,
		orderStatus: {
			type: String,
			enum: ["Pending", "Processed", "Shipped", "Delivered", "Cancelled"],
			default: "Pending",
		},
		shippingAddress: {
			addressLine1: String,
			addressLine2: String,
			city: String,
			state: String,
			postalCode: String,
			country: String,
		},
		billingAddress: {
			addressLine1: String,
			addressLine2: String,
			city: String,
			state: String,
			postalCode: String,
			country: String,
		},
		paymentMethod: { type: String, enum: ["Credit Card", "PayPal", "Bank Transfer"] },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model("Orders", orderSchema);
