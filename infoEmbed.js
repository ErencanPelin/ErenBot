const Discord = require("discord.js")
const client = new Discord.Client()
const infoEmbed = new Discord.MessageEmbed().setTitle("Configuration");
infoEmbed.setColor("0x7FFFD4");

infoEmbed.setDescription("Hi there! I am Eren's custom Pelican Bot!\n\nHope you enjoy the server and community we have, please follow the rules and we're glad your here! I'm here to help you with anything programming or server related!\n\n*Type `?commands` to see a list of all commands I have.*\n\nPlease keep in mind Eren Bot was made specifically for this Discord server, with no current support for expansion.")

module.exports = infoEmbed;