const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "「 ✦ Cycle ✦ 」";
/**
* @author NTKhang
* @author: do not delete it
* @message if you delete or edit it you will get a global ban
*/

module.exports = {
	config: {
		name: "help",
		version: "1.21",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		description: {
			vi: "Xem cách sử dụng của các lệnh",
			en: "View command usage"
		},
		category: "info",
		guide: {
			en: "{pn} [empty | <page number> | <command name>]"
				+ "\n   {pn} <command name> [-u | usage | -g | guide]: only show command usage"
				+ "\n   {pn} <command name> [-i | info]: only show command info"
				+ "\n   {pn} <command name> [-r | role]: only show command role"
				+ "\n   {pn} <command name> [-a | alias]: only show command alias"
		},
		priority: 1
	},

	langs: {
		en: {
			help:
				  `\n╭────⊣ COMMANDS`
				+ "\n%1"
				+ "\n│"
				+ "\n├──────────────⭓"
				+ "\n├⊣ PAGE [%2/%3]"
				+ "\n├⊣ %4 commands are available for use"
				+ "\n├⊣ Use %5help <page>"
				+ "\n╰─────────────⭓",
			help2: "%1├───────⭔"
				+ "\n│ » Currently, the bot has %2 commands that can be used"
				+ "\n│ %4"
				+ "\n╰─────────────⭓",
			commandNotFound: "Command \"%1\" does not exist",
			getInfoCommand: "╭──⊣ NAME ────⭓"
				+ "\n│ %1"
				+ "\n├─⊣ INFO"
				+ "\n│ Description: %2"
				+ "\n│ Other names: %3"
				+ "\n│ Other names in your group: %4"
				+ "\n│ Version: %5"
				+ "\n│ Role: %6"
				+ "\n│ Time per command: %7s"
				+ "\n│ Author: %8"
				+ "\n├──⊣ USAGE"
				+ "\n│%9"
				+ "\n╰──────⭔",
			onlyInfo: "╭── INFO ────⭓"
				+ "\n│ Command name: %1"
				+ "\n│ Description: %2"
				+ "\n│ Other names: %3"
				+ "\n│ Other names in your group: %4"
				+ "\n│ Version: %5"
				+ "\n│ Role: %6"
				+ "\n│ Time per command: %7s"
				+ "\n│ Author: %8"
				+ "\n╰─────────────⭓",
			onlyUsage: "╭── USAGE ────⭓"
				+ "\n│%1"
				+ "\n╰─────────────⭓",
			onlyAlias: "╭── ALIAS ────⭓"
				+ "\n│ Other names: %1"
				+ "\n│ Other names in your group: %2"
				+ "\n╰─────────────⭓",
			onlyRole: "╭── ROLE ────⭓"
				+ "\n│%1"
				+ "\n╰─────────────⭓",
			doNotHave: "Do not have",
			roleText0: "0 (All users)",
			roleText1: "1 (Group administrators)",
			roleText2: "2 (Admin bot)",
			roleText0setRole: "0 (set role, all users)",
			roleText1setRole: "1 (set role, group administrators)",
			pageNotFound: "Page %1 does not exist"
		}
	},

	onStart: async function ({ message, args, event, threadsData, getLang, role, globalData }) {
		const langCode = await threadsData.get(event.threadID, "data.lang") || global.GoatBot.config.language;
		let customLang = {};
		const pathCustomLang = path.normalize(`${process.cwd()}/languages/cmds/${langCode}.js`);
		if (fs.existsSync(pathCustomLang))
			customLang = require(pathCustomLang);

		const { threadID } = event;
		const threadData = await threadsData.get(threadID);
		const prefix = getPrefix(threadID);
		let sortHelp = threadData.settings.sortHelp || "name";
		if (!["category", "name"].includes(sortHelp))
			sortHelp = "name";
		const commandName = (args[0] || "").toLowerCase();
		let command = commands.get(commandName) || commands.get(aliases.get(commandName));
		const aliasesData = threadData.data.aliases || {
			// uid: ["userid", "id"]
		};
		if (!command) {
			for (const cmdName in aliasesData) {
				if (aliasesData[cmdName].includes(commandName)) {
					command = commands.get(cmdName);
					break;
				}
			}
		}

		if (!command) {
			const globalAliasesData = await globalData.get('setalias', 'data', []);
			// [{
			// 	commandName: "uid",
			// 	aliases: ["uid", "id]
			// }]
			for (const item of globalAliasesData) {
				if (item.aliases.includes(commandName)) {
					command = commands.get(item.commandName);
					break;
				}
			}
		}

		// ———————————————— LIST ALL COMMAND ——————————————— //
		if (!command && !args[0] || !isNaN(args[0])) {
			const arrayInfo = [];
			let msg = "";
			if (sortHelp == "name") {
				const page = parseInt(args[0]) || 1;
				const numberOfOnePage = 20;
				for (const [name, value] of commands) {
					if (value.config.role > 1 && role < value.config.role)
						continue;
					let describe = name;
					arrayInfo.push({
						data: describe,
						priority: value.priority || 0
					});
				}

				arrayInfo.sort((a, b) => a.data - b.data); // sort by name
				arrayInfo.sort((a, b) => a.priority > b.priority ? -1 : 1); // sort by priority
				const { allPage, totalPage } = global.utils.splitPage(arrayInfo, numberOfOnePage);
				if (page < 1 || page > totalPage)
					return message.reply(getLang("pageNotFound", page));

				const returnArray = allPage[page - 1] || [];
				const startNumber = (page - 1) * numberOfOnePage + 1;
				msg += (returnArray || []).reduce((text, item, index) => text += `│ ⚘ ${item.data}\n`, '').slice(0, -1);
				await message.reply(getLang("help", msg, page, totalPage, commands.size, prefix, doNotDelete));
			}
			else if (sortHelp == "category") {
				for (const [, value] of commands) {
					if (value.config.role > 1 && role < value.config.role)
						continue; // if role of command > role of user => skip
					const indexCategory = arrayInfo.findIndex(item => (item.category || "NO CATEGORY") == (value.config.category?.toLowerCase() || "NO CATEGORY"));

					if (indexCategory != -1)
						arrayInfo[indexCategory].names.push(value.config.name);
					else
						arrayInfo.push({
							category: value.config.category.toLowerCase(),
							names: [value.config.name]
						});
				}
				arrayInfo.sort((a, b) => (a.category < b.category ? -1 : 1));
				arrayInfo.forEach((data, index) => {
					const categoryUpcase = `${index == 0 ? `╭` : `├`}─── ${data.category.toUpperCase()} ${index == 0 ? "⭓" : "⭔"}`;
					data.names = data.names.sort().map(item => item = `│ ${item}`);
					msg += `${categoryUpcase}\n${data.names.join("\n")}\n`;
				});
				message.reply(getLang("help2", msg, commands.size, prefix, doNotDelete));
			}
		}
		// ———————————— COMMAND DOES NOT EXIST ———————————— //
		else if (!command && args[0]) {
			return message.reply(getLang("commandNotFound", args[0]));
		}
		// ————————————————— INFO COMMAND ————————————————— //
		else {
			const formSendMessage = {};
			const configCommand = command.config;

			let guide = configCommand.guide?.[langCode] || configCommand.guide?.["en"];
			if (guide == undefined)
				guide = customLang[configCommand.name]?.guide?.[langCode] || customLang[configCommand.name]?.guide?.["en"];

			guide = guide || {
				body: ""
			};
			if (typeof guide == "string")
				guide = { body: guide };
			const guideBody = guide.body
				.replace(/\{prefix\}|\{p\}/g, prefix)
				.replace(/\{name\}|\{n\}/g, configCommand.name)
				.replace(/\{pn\}/g, prefix + configCommand.name);

			const aliasesString = configCommand.aliases ? configCommand.aliases.join(", ") : getLang("doNotHave");
			const aliasesThisGroup = threadData.data.aliases ? (threadData.data.aliases[configCommand.name] || []).join(", ") : getLang("doNotHave");

			let roleOfCommand = configCommand.role;
			let roleIsSet = false;
			if (threadData.data.setRole?.[configCommand.name]) {
				roleOfCommand = threadData.data.setRole[configCommand.name];
				roleIsSet = true;
			}

			const roleText = roleOfCommand == 0 ?
				(roleIsSet ? getLang("roleText0setRole") : getLang("roleText0")) :
				roleOfCommand == 1 ?
					(roleIsSet ? getLang("roleText1setRole") : getLang("roleText1")) :
					getLang("roleText2");

			const author = configCommand.author;
			const descriptionCustomLang = customLang[configCommand.name]?.description;
			let description = checkLangObject(configCommand.description, langCode);
			if (description == undefined)
				if (descriptionCustomLang != undefined)
					description = checkLangObject(descriptionCustomLang, langCode);
				else
					description = getLang("doNotHave");

			let sendWithAttachment = false; // check subcommand need send with attachment or not

			if (args[1]?.match(/^-g|guide|-u|usage$/)) {
				formSendMessage.body = getLang("onlyUsage", guideBody.split("\n").join("\n│"));
				sendWithAttachment = true;
			}
			else if (args[1]?.match(/^-a|alias|aliase|aliases$/))
				formSendMessage.body = getLang("onlyAlias", aliasesString, aliasesThisGroup);
			else if (args[1]?.match(/^-r|role$/))
				formSendMessage.body = getLang("onlyRole", roleText);
			else if (args[1]?.match(/^-i|info$/))
				formSendMessage.body = getLang(
					"onlyInfo",
					configCommand.name,
					description,
					aliasesString,
					aliasesThisGroup,
					configCommand.version,
					roleText,
					configCommand.countDown || 1,
					author || ""
				);
			else {
				formSendMessage.body = getLang(
					"getInfoCommand",
					configCommand.name,
					description,
					aliasesString,
					aliasesThisGroup,
					configCommand.version,
					roleText,
					configCommand.countDown || 1,
					author || "",
					guideBody.split("\n").join("\n│")
				);
				sendWithAttachment = true;
			}

			if (sendWithAttachment && guide.attachment) {
				if (typeof guide.attachment == "object" && !Array.isArray(guide.attachment)) {
					const promises = [];
					formSendMessage.attachment = [];

					for (const keyPathFile in guide.attachment) {
						const pathFile = path.normalize(keyPathFile);

						if (!fs.existsSync(pathFile)) {
							const cutDirPath = path.dirname(pathFile).split(path.sep);
							for (let i = 0; i < cutDirPath.length; i++) {
								const pathCheck = `${cutDirPath.slice(0, i + 1).join(path.sep)}${path.sep}`; // create path
								if (!fs.existsSync(pathCheck))
									fs.mkdirSync(pathCheck); // create folder
							}
							const getFilePromise = axios.get(guide.attachment[keyPathFile], { responseType: 'arraybuffer' })
								.then(response => {
									fs.writeFileSync(pathFile, Buffer.from(response.data));
								});

							promises.push({
								pathFile,
								getFilePromise
							});
						}
						else {
							promises.push({
								pathFile,
								getFilePromise: Promise.resolve()
							});
						}
					}

					await Promise.all(promises.map(item => item.getFilePromise));
					for (const item of promises)
						formSendMessage.attachment.push(fs.createReadStream(item.pathFile));
				}
			}

			return message.reply(formSendMessage);
		}
	}
};

function checkLangObject(data, langCode) {
	if (typeof data == "string")
		return data;
	if (typeof data == "object" && !Array.isArray(data))
		return data[langCode] || data.en || undefined;
	return undefined;
}

function cropContent(content, max) {
	if (content.length > max) {
		content = content.slice(0, max - 3);
		content = content + "...";
	}
	return content;
}