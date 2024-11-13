const axios = require("axios");
const prefix = global.GoatBot.config.prefix;
module.exports = {
  config: {
    name: 'ai',
    usePrefix: false,
    category: 'ai',
    author: 'renz'
  },
  onStart: function(){},
  onChat: async function({event,message,api}) {
    const prefixRegex = new RegExp(`^${prefix}ai`)
    if(event.body?.match(prefixRegex) || /^ai/.test(event.body)) {

      try{
      const prompt = event.body?.replace(/^ai/, '').trim();

      const {data} = await axios.get("https://renzapi.onrender.com/api/ai2", {params: {
        prompt,
        uid: event.senderID
      }})
      message.reply(data.response)
        } catch (error) {
        console.error(error);
        message.reply("An error occured.")
      }


      
    }
  }
      }