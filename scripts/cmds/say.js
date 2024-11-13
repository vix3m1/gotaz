const axios = require("axios");

module.exports = {
  config: {
    name: 'tts',
    category: 'ai'
  },
  onStart: async function({api,args,message}) {
    const text = args.join(" ");
    if(!text) return message.reply("No text provided")
    try {
      const {data: reqData} = await axios.get(`https://renzapi.onrender.com/api/textToAi?prompt=${text}`);

      const {data: audioStream} = await axios.get(reqData.result, {responseType: "stream"})
      audioStream.path = "audio.mp3";

     await message.reply({attachment: audioStream})
      
    } catch (e) {
      console.error(e)
      
    }
  }
}