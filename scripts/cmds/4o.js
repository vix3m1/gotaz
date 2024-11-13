const axios = require("axios");

module.exports = {
  config: {
    name: 'gpt4',
    category: 'ai',
    aliases: ['4o', 'g4o']
  },
  onStart: function() {
  
  },
  onChat: async function({api,event,message}) {
    const input = event.body?.split(" ");
    if(/^.?(gpt4|4o|g4o)$/i.test(input[0])) {
      const prompt = input?.slice(1).join(" ");
        if(!prompt || prompt.trim().length == 0) {
          return message.reply("Usage: [gpt4 | 4o | g4o] <prompt>");
        }
      const dummy = await message.reply(`🔎: "${prompt}"`)
      try {
        

        const {data:response} = await axios.get(`https://joshweb.click/api/gpt-4o?q=${prompt}&uid=${event.senderID}`);
        return message.edit(response.result.trim(), dummy.messageID)
      } catch (e) {
        console.error(e)
        return message.edit("Ooh-oh. An error occured while fetching the response.", dummy.messageID) 
      }
    }
  }
}