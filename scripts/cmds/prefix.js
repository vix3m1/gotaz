const fs = require("fs-extra");
const { utils } = global;
const axios = require("axios");

module.exports = {
	config: {
		name: "prefix",
		version: "1.4",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		description: "Thay đổi dấu lệnh của bot trong box chat của bạn hoặc cả hệ thống bot (chỉ admin bot)",
		category: "config",
		guide: {
			en: "   {pn} <new prefix>: change new prefix in your box chat"
				+ "\n   Example:"
				+ "\n    {pn} #"
				+ "\n\n   {pn} <new prefix> -g: change new prefix in system bot (only admin bot)"
				+ "\n   Example:"
				+ "\n    {pn} # -g"
				+ "\n\n   {pn} reset: change prefix in your box chat to default"
		}
	},

	langs: {
		en: {
			reset: "Your prefix has been reset to default: %1",
			onlyAdmin: "Only admin can change prefix of system bot",
			confirmGlobal: "Please react to this message to confirm change prefix of system bot",
			confirmThisThread: "Please react to this message to confirm change prefix in your box chat",
			successGlobal: "Changed prefix of system bot to: %1",
			successThisThread: "Changed prefix in your box chat to: %1",
			myPrefix: "Prefix is: %1"
		}
	},

	onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
		if (!args[0])
			return message.SyntaxError();

		if (args[0] == 'reset') {
			await threadsData.set(event.threadID, null, "data.prefix");
			return message.reply(getLang("reset", global.GoatBot.config.prefix));
		}

		const newPrefix = args[0];
		const formSet = {
			commandName,
			author: event.senderID,
			newPrefix
		};

		if (args[1] === "-g")
			if (role < 2)
				return message.reply(getLang("onlyAdmin"));
			else
				formSet.setGlobal = true;
		else
			formSet.setGlobal = false;

		return message.reply(args[1] === "-g" ? getLang("confirmGlobal") : getLang("confirmThisThread"), (err, info) => {
			formSet.messageID = info.messageID;
			global.GoatBot.onReaction.set(info.messageID, formSet);
		});
	},

	onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
		const { author, newPrefix, setGlobal } = Reaction;
		if (event.userID !== author)
			return;
		if (setGlobal) {
			global.GoatBot.config.prefix = newPrefix;
			fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
			return message.reply(getLang("successGlobal", newPrefix));
		}
		else {
			await threadsData.set(event.threadID, newPrefix, "data.prefix");
			return message.reply(getLang("successThisThread", newPrefix));
		}
	},

	onChat: async function ({ event, message, getLang }) {
		if (event.body && event.body.toLowerCase() === "prefix")
			return async () => {
				const upt = process.uptime();
				const seconds = Math.floor(upt % 60);
				const minutes = Math.floor(upt / 60 % 60);
				const hours = Math.floor(upt / 3600 % 24);
				const days = Math.floor(upt / 86400);
				
				const {data:gifStream} = await axios.get("https://media1.tenor.com/m/uA9NpxgqNKIAAAAd/gojo-satoru-satoru-gojo.gif", {responseType: 'stream'});

				gifStream.path = "prefix.gif";

			 message.reply({
				 body: getLang("myPrefix", global.GoatBot.config.prefix),
				 attachment: gifStream
			 })
				
			};
	}
};