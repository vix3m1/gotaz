const ax = require("axios");

module.exports = {
  config: {
    name: "eabab",
  },
  onStart: async function({api,message}) {
    try {
      await message.send("Cooking it up..");
      const {data: result} = await ax.get("https://hiroshi-api.onrender.com/video/eabab");
      const msg = `\nTitle: ${result.title}\nUser: ${result.username}`;
      const {data: vidSt} = await ax.get(result.link, {responseType: "stream"});
      vidSt.path = "eabab-" + Date.now() + ".mp4";

      return message.reply({body: msg, attachment: vidSt})
    } catch(e) {
      console.error(e);
      return message.reply("An error occured while fetching your hot ass eabab");
      
    }
  }
}