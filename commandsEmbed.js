const Discord = require("discord.js")
const client = new Discord.Client()
const commandEmbed = new Discord.MessageEmbed().setTitle("Pelican Bot Commands List");
commandEmbed.setColor("0x70FF87");

commandEmbed.setDescription("Here are the commands I can do!\n");
commandEmbed.addFields(
  {name: "?members", value: "Shows the number of users currently on the server! (includes bots)", inline:false},
	{name: "?checkstreak", value: "Shows the current streak of e's!(Only works in 'e' channel)", inline:false},
	{name: "?checkhigh", value: "Shows the highest streak of e's!(Only works in 'e' channel)", inline:false},
  {name: "?search <what to search>", value: "Searches the web and YouTube for whatever your looking for!\n\u200b\n\u200b", inline:false}
  );

commandEmbed.addField("Admin Commands", "The following commands require admin perms!");
commandEmbed.addFields(
  {name: "?setkey <key> <value>", value: "Finds the key in the database and sets its value", inline:false},
	{name: "?softwarn <@user> <reason>", value: "Softwarns are not saved in the server log, however they are used to notifer the user that their actions are violating the server rules!"},
	{name: "?getkey <key>", value: "Finds the key in the database and returns its value", inline:false},
	{name: "?removekey <key>", value: "Removes the specified key from the database", inline:false},
	{name: "?announce <msg>", value: "Announces msg in the announcenemts channel!", inline:false},
	{name: "?config", value: "Configure the bot's settings", inline:false},
	{name: "?setstatus <online/idle/dnd> <watching/playing/streaming> <action>", value: "Set's this bots current status", inline:false});
module.exports = commandEmbed;