const subscriptions = require("../models/subscriptions");
const users = require("../models/users");
const { sendJsonResponse } = require("../utils/helpers");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.WEBHOOK_ENDPOINT_SECRET;

const getPaymentInfo = async (request, response) => {
	let subscriptionInfo = null;

	try {
		const { paymentMode, paymentID } = request.query;

		if (paymentMode === "subscription") {
			subscriptionInfo = await stripe.subscriptions.retrieve(paymentID);
		}

		if (subscriptionInfo) return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record Found", subscriptionInfo);
		return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "No Record Found!", null);
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const getPaymentSession = async (request, response) => {
	try {
		const { gateway, paymentMode, subscription } = request.body;
		const { userID: authenticatingUserID } = request.jwtPayload;

		if (!gateway || !paymentMode) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		if (gateway === "stripe" && paymentMode === "subscription" && subscription?.duration) {
			const dbUser = await users.findOne({ _id: authenticatingUserID });

			if (dbUser?.subscription?.subscriptionPlanID) {
				const dbSubscription = await subscriptions.findOne({ _id: dbUser.subscription.subscriptionPlanID });

				if (dbSubscription?.stripePriceKeys?.[subscription.duration]) {
					const session = await stripe.checkout.sessions.create({
						mode: paymentMode,
						payment_method_types: ["card"],
						line_items: [
							{
								price: dbSubscription.stripePriceKeys[subscription.duration],
								quantity: 1,
							},
						],
						client_reference_id: authenticatingUserID,
						success_url: process.env.PAYMENT_SUCCESS_URL,
						cancel_url: process.env.PAYMENT_FAILED_URL,
					});

					if (session) {
						return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record Created::success", session);
					} else {
						return sendJsonResponse(
							response,
							HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
							false,
							"Record Created::failure",
							null
						);
					}
				} else {
					return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "Price Key Not Found!", null);
				}
			} else {
				return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "User Subscription Not Found!", null);
			}
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.NOT_ACCEPTABLE, false, "Payment Not Supported!", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const handleWebhook = async (request, response) => {
	let event = null;
	let subscriptionInfo = null;
	let sessionCompletePayload = {
		client_reference_id: null,
		subscriptionPaymentID: null,
		paymentStatus: null,
		paymentType: null,
	};

	try {
		const sig = request.headers["stripe-signature"];

		event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);

		switch (event.type) {
			case STRIPE_EVENTS.SESSION_COMPLETED:
				const session = event.data.object;

				Object.assign(sessionCompletePayload, {
					client_reference_id: session?.client_reference_id,
					subscriptionPaymentID: session?.subscription,
					paymentStatus: session?.payment_status,
					paymentType: session?.payment_method_types,
				});
				break;
			case STRIPE_EVENTS.PAYMENT_SUCCEEDED:
				// Handle other events if needed
				break;
			case STRIPE_EVENTS.PAYMENT_FAILED:
				// Handle other events if needed
				break;
			default:
				return response.status(400).end();
		}

		if (sessionCompletePayload?.subscriptionPaymentID) {
			subscriptionInfo = await stripe.subscriptions.retrieve(sessionCompletePayload.subscriptionPaymentID);

			if (subscriptionInfo) {
				await users.findOneAndUpdate(
					{ _id: sessionCompletePayload.client_reference_id },
					{
						$set: {
							"subscription.activationDate": new Date(subscriptionInfo?.current_period_start * 1000),
							"subscription.expiryDate": new Date(subscriptionInfo?.current_period_end * 1000),
							"subscription.isActive": subscriptionInfo?.status === "active" ? true : false,
							"subscription.subscriptionPaymentID": sessionCompletePayload.subscriptionPaymentID,
							"subscription.paymentStatus": sessionCompletePayload.paymentStatus,
							"subscription.paymentType": sessionCompletePayload.paymentType,
						},
					}
				);
			}
		}

		response.status(200).json({ received: true });
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

const cancelSubscriptionPlan = async (request, response) => {
	try {
		const { userID, paymentMode, reason } = request.query;
		const { userID: authenticatingUserID } = request.jwtPayload;

		if (!userID || !paymentMode) {
			return sendJsonResponse(response, HTTP_STATUS_CODES.BAD_REQUEST, false, "Missing parameters!", null);
		}

		if (paymentMode === "subscription") {
			const authenticatingDBUser = await users.findOne({ _id: authenticatingUserID });
			const dbUser = await users.findOne({ _id: userID });

			if (dbUser && authenticatingDBUser) {
				if (userID === authenticatingUserID || authenticatingDBUser.userRole === "admin") {
					if (dbUser?.subscription?.subscriptionPaymentID) {
						const subscription = await stripe.subscriptions.update(dbUser?.subscription?.subscriptionPaymentID, {
							cancel_at_period_end: true,
						});

						if (subscription.cancel_at_period_end) {
							const updatedUser = await users.findOneAndUpdate(
								{ _id: userID },
								{
									$set: {
										"subscription.cancelation.status": true,
										"subscription.cancelation.date": subscription?.canceled_at * 1000,
										"subscription.cancelation.reason": reason || subscription?.cancellation_details?.reason,
										"subscription.isActive": false,
										"subscription.isActiveByAdmin": false,
									},
								},
								{ fields: { password: 0 }, new: true }
							);

							if (updatedUser) {
								return sendJsonResponse(response, HTTP_STATUS_CODES.OK, true, "Record updated::success", updatedUser);
							} else {
								return sendJsonResponse(
									response,
									HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
									false,
									"Record updated::failure",
									null
								);
							}
						} else {
							return sendJsonResponse(
								response,
								HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
								false,
								"Subscription Update Error!",
								null
							);
						}
					} else {
						return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "Subscription Not Found!", null);
					}
				} else {
					return sendJsonResponse(response, HTTP_STATUS_CODES.UNAUTHORIZED, false, "Access denied!", null);
				}
			} else {
				return sendJsonResponse(response, HTTP_STATUS_CODES.NOTFOUND, false, "Record Not Found!", null);
			}
		} else {
			return sendJsonResponse(response, HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY, false, "Currently Not Supported!", null);
		}
	} catch (error) {
		return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
	}
};

module.exports = {
	getPaymentSession,
	handleWebhook,
	getPaymentInfo,
	cancelSubscriptionPlan,
};
