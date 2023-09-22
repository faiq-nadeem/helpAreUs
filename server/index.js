require("dotenv").config();
require("./utils/constants.js");

const http = require("http");
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const { sendJsonResponse } = require("./utils/helpers.js");

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);

app.use(rateLimit(EXPRESS_RATE_LIMIT));

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(
	cors({
		origin: [process.env.ADMIN_PANEL_URL, process.env.WEBSITE_URL],
		credentials: true,
	}),
);

app.get("/", (req, res) => {
	res.send("Welcome to Server");
});

app.use("/v1/categories", require("./routes/categories.js"));
app.use("/v1/guests", require("./routes/guests.js"));
app.use("/v1/orders", require("./routes/orders.js"));
app.use("/v1/organizations", require("./routes/organizations.js"));
app.use("/v1/partners", require("./routes/partners.js"));
app.use("/v1/payment-gateways", require("./routes/paymentGateways.js"));
app.use("/v1/projects", require("./routes/projects.js"));
app.use("/v1/products", require("./routes/products.js"));
app.use("/v1/users", require("./routes/users.js"));

app.use((error, request, response, next) => {
	return sendJsonResponse(response, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Error!", error);
});

mongoose
	.connect(process.env.MONGO_DB_CONNECTION_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log(`Database connection::success -> MongoDB`);
		server.listen(PORT, () => console.log(`Server Running at -> http://localhost:${PORT}`));
	})
	.catch((error) => {
		console.error("Database connection error:", error);
		process.exit(1);
	});
