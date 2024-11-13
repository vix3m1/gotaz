const axios = require("axios");

module.exports = {
  config: {
    name: 'spotify',
    aliases: ['sp', 'song'],
    category: 'media'
  },
  onStart: function(){},
  onChat: async function({api,event,message}) {
    const input = event.body?.split(" ");
    
    if(/^.?(sp|spotify|song)$/i.test(input[0])){
      
    try {
      const q = input?.slice(1)?.join(" ");
      if(!q || q.trim().length == 0) {
        return message.reply("Usage: [sp | spotify | song] <song name>")
      }


      const {data: result} = await axios.get("https://hiroshi-api.onrender.com/tiktok/spotify", {params:{search: q}});

      const {data: imageStream} = await axios.get(result[0].image, {responseType: 'stream'});
      const {data: mp3Stream} = await axios.get(result[0].download, {responseType: 'stream'});

      imageStream.path = event.senderID + ".jpg";
      mp3Stream.path = event.senderID + ".mp3";

      await message.reply({attachment: imageStream})
      await message.send({body: result[0].title,attachment: mp3Stream})

      return;
    } catch (e) {
      await message.reply("Error")
     return console.error(e)
    }
  }
  }
}