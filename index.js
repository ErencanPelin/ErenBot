const keepAlive = require("./server")
const Discord = require("discord.js")
const client = new Discord.Client()
const blacklisted = require("./profanity.js");
const infoEmbed = require("./infoEmbed.js");
const configEmbed = require("./configEmbed.js");
const commandsEmbed = require("./commandsEmbed.js");
const Database = require("@replit/database")
const db = new Database()

var splitMessage;
var softwarnReason = "";
var cleanedMsg;

client.on("ready", () => 
{
  console.log(`Logged in as ${client.user.tag}!`)
  client.user.setPresence(
  {
    status: 'online',
    //You can show online, idle....
  });
  client.user.setActivity("?commands",
  {
    type: 'PLAYING',
  });
})

client.on("message", msg => 
{
  splitMessage = msg.content.split(" ");

	if (msg.content.toLocaleLowerCase().startsWith("i need help"))
	{
		msg.reply("**Hey there!\nBefore asking for help,** be sure to try Google! It's probably smarter than most of us 😅\n\nIf you still can't find your answer, try creating a thread in one of the help channels and someone will help you shortly (please don't spam ping its quite annoying 😄)")
		return;
	}

	//suggestions
	if (splitMessage[0].toLowerCase() == "?suggest" && splitMessage.length >= 2)
	{
		if (splitMessage.length < 2)
		{
			msg.channel.send("You need to actually suggest something!");
			return;
		}
		//make sure we are in a whitelisted channel
		db.get(msg.guild.id + "|" + "suggestChannel").then(suggestChannel => 
		{		
			if (msg.channel.id == suggestChannel)
			{
				db.get(msg.guild.id + "|" + "lastSuggest").then(value => 
				{
					var suggestNum = parseInt(value) + 1;				
					db.set(msg.guild.id + "|" + "lastSuggest", suggestNum);
	
					var newSuggest = new Discord.MessageEmbed().setTitle("#" + suggestNum + "\n" + msg.author.username + ":");
					newSuggest.setColor("0x7FFFD4");
					newSuggest.setDescription(msg.content.substring(9));
					msg.channel.send(newSuggest).then(function (message) {
						message.react("⬆️")
						message.react("⬇️")
					});
					msg.delete();
	
					db.set(msg.guild.id + "|" + suggestNum, msg.author.username + "," + msg.content.substring(9));
				});
			}
			else
			{
				//we aren't in a correct channel
				msg.channel.send("Suggestions are disabled in this channel");
				msg.delete();
				return;
			}
		});
	}

  //chat filtering
	db.get(msg.guild.id + "|" + "logChannel").then(logsChannel => 
	{		
		if (msg.channel.id === logsChannel) 
		{
		}
		else
		{
			cleanedMsg = removeChar(msg.content, '*');
			cleanedMsg = removeChar(cleanedMsg, '|');
			cleanedMsg = removeChar(cleanedMsg, '_');
			cleanedMsg = removeChar(cleanedMsg, "`");
			for (var i in blacklisted) 
			{
				if (cleanedMsg.includes(blacklisted[i])) 
				{
					db.get(msg.guild.id + "|" + "modrole").then(modRole => 
					{
						client.channels.cache.get(logsChannel).send(`<@&${modRole}>**` + msg.author.tag + "**:\n```" + msg.content + "```\n" + "Bad word detected: *" + blacklisted[i] + "*");
		
						msg.delete();
						return;
					});
					break;
				}
			}
		}
	});

  //admin commands
  if (msg.author.tag === "CraazyPelican#2071") 
  {
		if (msg.content.startsWith("?"))
		{
			switch (splitMessage[0])
			{
				case "?-id":
					msg.channel.send(msg.guild.id);
					return;
				case "?announce":
					if (splitMessage.length > 1)
					{
						db.get(msg.guild.id + "|" + "announceChannel").then(announceChannel => 
						{
							client.channels.cache.get(announceChannel).send(msg.content.replace("?announce", ""));
						});
					}
					else
						msg.reply("You need to provide content to announce!");
					return;
				case "?removekey":
					if (splitMessage[2] != null && splitMessage[2] == "-a") //remove overall key
					{
						db.get(splitMessage[1]).then(globalValue => 
						{
							if (globalValue == null)
								msg.reply("No such key.");
							else
							{
								db.delete(splitMessage[1]).then(() => 
								{
									msg.reply("Successfully deleted Global key: " + splitMessage[1]);
								});
							}
						});
					}
					else
					{
						db.get(msg.guild.id + "|" + splitMessage[1]).then(value => 
						{
							if (value == null)
								msg.reply("No such key.");
							else
							{
								db.delete(msg.guild.id + "|" + splitMessage[1]).then(() => 
								{
									msg.reply("Successfully deleted key: " + splitMessage[1]);
								});
							}
						});
					}
					return;
				case "?setkey":
					if (splitMessage[2] == null)
					{
						msg.reply("You need to specify a key value: ?setkey <key> <value>")
						return;
					}
					db.set(msg.guild.id + "|" + splitMessage[1], splitMessage[2]).then(() => 
					{
						msg.reply("Successfully set key: " + splitMessage[1] + " to: " + splitMessage[2]);
					});
					return;
				case "?getkey":
					if (splitMessage[2] != null && splitMessage[2] == "-a") //remove overall key
					{
						db.get(splitMessage[1]).then(globalKey => 
						{
							if (globalKey == null)
							{
								msg.reply("No such key.");
								return;
							}
							db.delete(splitMessage[1]).then(() => 
							{
								msg.reply("Global Key: " + splitMessage[1] + " = " + globalKey);
							});
						});
						return;
					}
					db.get(msg.guild.id + "|" + splitMessage[1]).then(value => 
					{
						if (value == null)
						{
							msg.reply("No such key.");
							return;
						}
						msg.reply("Key: " + splitMessage[1] + " = " + value);
					});
					return;
				case "?setstatus":
					if (splitMessage.length === 4)
      		{
						//status
        		if (splitMessage[1].toLowerCase() === "o" ||
          		splitMessage[1].toLowerCase() === "i" ||
          		splitMessage[1].toLowerCase() === "d") 
          	{
							//activity
          		if (splitMessage[2].toLowerCase() === "p" ||
            		splitMessage[2].toLowerCase() === "w" ||
            		splitMessage[2].toLowerCase() === "l" ||
           		 	splitMessage[2].toLowerCase() === "s") 
            	{
								var presence;
								switch (splitMessage[1].toLowerCase())
								{
									case "o":
										presence = "online";
										break;
									case "i":
										presence = "idle";
										break;
									case "d":
										presence = "dnd";
										break;
								}
								var activity;
								switch (splitMessage[2].toLowerCase())
								{
									case "p":
										activity = "PLAYING";
										break;
									case "w":
										activity = "WATCHING";
										break;
									case "l":
										activity = "LISTENING";
										break;
									case "s":
										activity = "STREAMING";
										break;
								}
              	client.user.setPresence(
              	{
                	status: presence,
	              });
              	client.user.setActivity(splitMessage[3],
              	{
                	type: activity,
              	});
								msg.reply("Bot status set!\n" + presence + " " + activity + " " + splitMessage[3]);
           	 	}
							else
								msg.reply("Invalid activity, should be p/w/l/s");
        		}
						else
							msg.reply("Invalid status, should be o/i");
      		}
					else
					{
						msg.reply("Syntax error: `?setstatus <o/i> <p/w/l/s> <action>\n----\no - online\ni-idle\n\np - playing\nw - watching\nl - listening\ns - streaming`");
					}
					return;
				
			}
		}
				
//approve/deny suggestions
		if ((splitMessage[0].toLowerCase() == "?approve" ||
		splitMessage[0].toLowerCase() == "?deny" ||
		splitMessage[0].toLowerCase() == "?consider") && splitMessage.length == 2)
		{
			try 
			{
				if (!isNaN(parseInt(splitMessage[1])))
				{
					db.get(msg.guild.id + "|" + splitMessage[1]).then(value => 
					{
						if (value == null)
						{
							msg.channel.send("Could not find suggestion ID");
							msg.delete();
							return;
						}

						var suggest = value.split(",");

						var newResponse = new Discord.MessageEmbed();

						if (splitMessage[0].toLowerCase() == "?approve")
						{
							newResponse.setTitle("#" + splitMessage[1] + " Approved:\n");
							newResponse.setColor("0x7FFF7F");
						}
						else if (splitMessage[0].toLowerCase() == "?consider")
						{
							newResponse.setTitle("#" + splitMessage[1] + " Considered:\n");
							newResponse.setColor("0xFFFF6F");
						}
						else
						{
							newResponse.setTitle("#" + splitMessage[1] + " Denied:\n");
							newResponse.setColor("0xFF6F6F");
						}
						
						newResponse.setDescription(suggest[0] + ": " + suggest[1]);
						msg.channel.send(newResponse);
						msg.delete();
						db.delete(splitMessage[1]);
					});
				}
				else
				{
					msg.channel.send("Could not find suggestion ID");
					msg.delete();
				}
			}
			catch (exception)
			{
				msg.channel.send("Could not find suggestion ID");
				msg.delete();
			}
		}
		else if (splitMessage[0].toLowerCase() == "?approve" ||
		splitMessage[0].toLowerCase() == "?deny" || splitMessage[0].toLowerCase() == "?consider" )
		{
			msg.channel.send("Please specify a suggestion #");
			msg.delete();
		}

//config commands
		if (splitMessage[0].toLowerCase() == "?config")
		{
			if (splitMessage[1] != null)
			{
				switch (splitMessage[1].toLowerCase())
				{
					case "-espam":
						if (splitMessage[2] == null)
						{
							msg.reply("you need to specify: <channel id>");
							return;
						}
						//set espam channel in db
						db.set(msg.guild.id + "|" + "espamChannel", splitMessage[2]);
						msg.reply("set espam channel to: " + splitMessage[2]);
						return;
					case "-modrole":
						if (splitMessage[2] == null)
						{
							msg.reply("you need to specify: <role id>");
							return;
						}
						//set modrole id in db
						db.set(msg.guild.id + "|" + "modrole", splitMessage[2]);
						msg.reply("set modrole id to: " + splitMessage[2]);
						return;
					case "-suggestions":
						if (splitMessage[2] == null)
						{
							msg.reply("you need to specify: <channel id>");
							return;
						}
						//set suggest channel in db
						db.set(msg.guild.id + "|" + "suggestChannel", splitMessage[2]);
						msg.reply("set suggestion channel to: " + splitMessage[2]);
						return;
					case "-logs":
						if (splitMessage[2] == null)
						{
							msg.reply("you need to specify: <channel id>");
							return;
						}
						//set log channel in db
						db.set(msg.guild.id + "|" + "logChannel", splitMessage[2]);
						msg.reply("set logs channel to: " + splitMessage[2]);
						return;
					case "-announcements":
						if (splitMessage[2] == null)
						{
							msg.reply("you need to specify: <channel id>");
							return;
						}
						//set announcement channel in db
						db.set(msg.guild.id + "|" + "announceChannel", splitMessage[2]);
						msg.reply("set announcements channel to: " + splitMessage[2]);
						return;
					case "-general":
						if (splitMessage[2] == null)
						{
							msg.reply("you need to specify: <channel id>");
							return;
						}
						//set general channel in db
						db.set(msg.guild.id + "|" + "generalChannel", splitMessage[2]);
						msg.reply("set general channel to: " + splitMessage[2]);
						return;
				}
			}
			
			msg.reply(configEmbed);
		}
  }

	//moderator commands
	try
	{
		db.get(msg.guild.id + "|" + "modrole").then(value => //getmodrole
		{
			if (msg.member.roles.cache.has(value))
			{
				if (splitMessage[0].toLowerCase() === "?softwarn")
				{
					if (splitMessage.length < 3)
					{
						msg.channel.send("Incorrect format! Required `?softwarn <@user> <reason>`");
						return;
					}
					if (msg.mentions.members.size != 1 || msg.content.includes("@here") || msg.content.includes("@everyone"))
					{
						msg.channel.send("You must mention 1 user to softwarn");
						return;
					}
					else //successfully warned
					{
						softwarnReason = "";
						var i = 2;
						while(i < splitMessage.length)
						{
							softwarnReason += splitMessage[i] + " ";
							i++;
						}
						let user = client.users.cache.find(user => user.id === splitMessage[1].replace('<@!', '').replace('>',''));
	
						//log warn to #logs
						db.get(msg.guild.id + "|" + "logChannel").then(logsChannel => //log channel
						{
							client.channels.cache.get(logsChannel).send("User notified!\n```User: " + user.username + "\nReason: " + softwarnReason + "```");
						});
						//send ping in general chat
						db.get(msg.guild.id + "|" + "generalChannel").then(generalChannel => //general chat
						{
							client.channels.cache.get(generalChannel).send("Hey! " + splitMessage[1] + "\n```This is a warning for: " + softwarnReason + "```\nPlease keep in mind the server rules! :)");
						});
					}
				}
			}
		});
	}
	catch 
	{
		console.log("Unexpected Error occured:");
	}

	//general commands
	switch(splitMessage[0].toLowerCase())
	{
		case "?commands":
    	msg.channel.send(commandsEmbed);
			return;
		case "?members":
    	msg.reply("There is: " + msg.guild.memberCount + " people in the server!");
			return;
		case "?search":
			var searchString = "https://www.google.com/search?q=";
      var ytString = "https://www.youtube.com/results?search_query=";

      var i = 1;
      while(i < splitMessage.length)
      {
        searchString += splitMessage[i] + "+";
        ytString += splitMessage[i] + "+";
        i++;
      }
      //https://www.youtube.com/results?search_query=how+to
     	// msg.react("✅");
      msg.reply("Here's what I found online:\n\nGoogle: " + searchString + "\nYouTube: " + ytString);
			return;
	}

  //fun
	if (msg.channel.id === '886574939879137320' && msg.author.tag != client.user.tag)
	{
		try
		{
			if(!CheckEString(msg.content) && msg.author.tag != client.user.tag && 
			splitMessage[0].toLowerCase() != "?checkstreak" &&
			splitMessage[0].toLowerCase() != "?checkhigh") 
			{ 			
				db.get(msg.guild.id + "|" + "e").then(value => {	
					msg.react("❌");
					msg.channel.send("Streak ruined at " + value + "!");
					db.set(msg.guild.id + "|" + "e", 0);
				});
			}
			else if (splitMessage[0].toLowerCase() === "?checkstreak")
			{
				db.get(msg.guild.id + "|" + "e").then(value => {
					msg.channel.send("The streak is at: " + value + "!").then(message => {
						setTimeout(() => message.delete(), 10000)
						msg.delete();
					});
				});
			}
			else if (splitMessage[0].toLowerCase() === "?checkhigh")
			{
				db.get(msg.guild.id + "|" + "eHigh").then(value => {
					msg.channel.send("The highest streak is: " + value + "!").then(message => {
						setTimeout(() => message.delete(), 5000)
						msg.delete();
					});
				});
			}
			else
			{				
				db.get(msg.guild.id + "|" + "e").then(value => {	
					msg.react("✅");
					db.set(msg.guild.id + "|" + "e", parseInt(value) + 1);
					db.get(msg.guild.id + "|" + "eHigh").then(highscore => 
					{
							if (highscore < value + 1)
							{
								db.set("eHigh", value + 1).then(() => {});
							}
					});
				});
			}
		}
		catch{}
	}
	else 
	{
		// if (msg.content.includes("sus")) 
		// {
		// 	msg.react("😳");
		// }

		// if (msg.content.toLowerCase().includes("swag")) 
		// {
		// 	msg.react("😎");
		// }

		if (msg.content.toLowerCase().includes("eren is the best")) 
		{
			msg.react("❤️");
		}

		if (msg.mentions.has(client.user)) 
		{
			if (!msg.content.includes("@here") && !msg.content.includes("@everyone")) 
			{
				msg.reply(infoEmbed).then(message => {
						setTimeout(() => message.delete(), 10000)
					});
			}
		}

		//filter spam
	/*	if (msg.channel.id != "849207012508434443" &&
		msg.channel.id != "862147491964780607" &&
		msg.channel.id != "874111062813843496")
		db.get("wordHistory").then(value => 
		{
			if (msg.content === value && msg.content != "")
			{
				msg.delete();
			}
			else
			{
				db.set("wordHistory", msg.content).then(() => {});
			}
		});*/
	}
})

function CheckEString(a)
{
	for (let i = 0; i < a.length; i++)
	{
		if(!'ÉéÈèÊêḘḙĚěĔĕẼẽḚḛẺẻĖėËëĒēȨȩĘęᶒɆɇȄȅẾếỀềỄễỂểḜḝḖḗḔḕȆȇẸẹỆệⱸᴇƏəƎƐɛＥｅᴂᴔÆæᴁᴭᵆǼǽǢǣŒœᵫⓔ⒠e∊€ḕḗḙḛḝẹẻệễểềếẽἐἑἒἓἕἔ∃ɛee∊έὲḕḗeḙḛḝệέὲἐἑἒἕἔἓẹễ∃ểềếẽẻeEᵉ \n'.includes(a[i].toLowerCase()))
		{
			return false;
		}
	}
	if (a.length >= 1)
		return true;
	else
		return false;
}

function removeChar(s, c)
{
    let j, count = 0, n = s.length;
    let t = s.split("");
     
    for(let i = j = 0; i < n; i++)
    {
        if (t[i] != c)
            t[j++] = t[i];
        else
            count++;
    }
      
    while (count > 0)
    {
        t[j++] = '\0';
        count--;
    }
    return t.join("");
}

const mySecret = process.env['TOKEN']
keepAlive()
client.login(process.env.TOKEN)