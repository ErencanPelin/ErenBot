const Discord = require("discord.js")
const client = new Discord.Client()
const configEmbed = new Discord.MessageEmbed().setTitle("I am born");
configEmbed.setColor("0x70FF87");

configEmbed.setDescription("All commands start with ?config:\n");
configEmbed.addFields(
  {name: "-espam <channel id>", value: "Sets e spam channel for server", inline:false},
	{name: "-modrole <role id>", value: "Sets moderation role ID for server", inline:false},
	{name: "-suggestions <channel id>", value: "Sets suggestions channel ID for server", inline:false},
	{name: "-logs <channel id>", value: "Sets logs channel ID for server", inline:false},
  {name: "-announcements <channel id>", value: "Sets announcements channel ID for server", inline:false},
	{name: "-general <channel id>", value: "Sets general channel ID for server", inline:false}
  );

module.exports = configEmbed;