console.log("starting...");
const express = require("express");

const server = express();

console.log("Waking up server!");
server.all("/", (req, res) => {
  res.send("Bot is running!")
})

console.log("Server Active!");
function keepAlive() {
	server.listen(3000, () => {
		console.log("Server is ready.")
	})
}

module.exports = keepAlive