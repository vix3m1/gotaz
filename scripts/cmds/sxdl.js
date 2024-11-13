const axios = require("axios");

module.exports = {
  config: {
    name: "create",
    aliases: ["gen", "img"],
    category: 'image gen'
  },
  onStart: async function({api,args,event,message}) {
    const prompt = args.join(" ");
    if(!prompt) return message.reply(`Usage:  ${global.utils.getPrefix(event.threadID)}${this.config.name} <prompt>`)
    message.reaction("⏳", event.messageID);
    try {
      const {data:img}  = await axios.get("https://renzapi.onrender.com/api/sxdl", {params:{prompt}, responseType: 'stream'});

      img.path = Date.now() + ".jpg";
      message.reactions("✅", event.messageID);
      return message.reply({attachment: img})
    } catch (e) {
      console.error(e)

      return message.reply("An error occured.")
    }
  }
}