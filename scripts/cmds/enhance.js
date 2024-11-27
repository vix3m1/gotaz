const axios = require("axios");

module.exports = {
  config: {
    name: "remini"
  },
  onStart: async function({api,args,message,event}) {
    
    if(!event.type == "message_reply" || !event.messageReply.attachments) {
      return message.reply("Please reply on an image/photo")
    }
    try {
      const url = event.messageReply.attachments[0].url;
      const {data: result} = await axios.get("https://hiroshi-api.onrender.com/image/upscale", {params: {
        url
      }})
      const {data: imgSt} = await axios.get(result, {responseType: "stream"});
      imgSt.path = "enhanced-" + Date.now() + ".png";
      return message.reply({attachment: imgSt});
    } catch (e) {
      console.error(e);
    }
  }
}