const { saveAndSendMessage } = require("../controllers/chats");

module.exports = (io) => {
	io.on("connection", (socket) => {
		console.log("User connected:", socket.id);

		socket.on("send-message", (message) => saveAndSendMessage(io, socket, message));

		// ... other socket events and their corresponding handlers

		socket.on("joinRoom", (groupID) => socket.join(groupID));

		socket.on("disconnect", () => {
			console.log("User disconnected:", socket.id);
		});
	});
};
