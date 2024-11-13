const axios = require("axios");


module.exports = {
  config: {
    name: 'cosplay',
    role: 1,
    category: 'entertainment'
  },
  onStart: async function({message}) {
    try {
      const {data:{videoUrl}} = await axios.get("https://renzapi.onrender.com/api/cosplay");
      const {data:cosVid} = await axios.get(videoUrl, {responseType: 'stream'});
      cosVid.path = Date.now() + ".mp4";

     return message.reply({attachment: cosVid})
    } catch (e) {
      console.error(e);
      return message.reply("An error occured while fetching the video.")
    }
  }
}