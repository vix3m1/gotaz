const axios = require("axios");

module.exports = {
  config: {
    name: 'lyrics',
    category: 'tools',
    author: 'renz'
  },
  onStart: async function({api,event,commandName,message,args}){
    const query = args.join(" ");
    if(!query) return message.reply("No query provided.\n\nGuide: xlyrics <song name>");
    const dummy = await message.reply("Finding the lyrics...");
    try {
      const {data: result} = await axios.get(`https://renzapi.onrender.com/api/lyricsSearch?q=${query}`)
      api.unsendMessage(dummy.messageID)
      const list = result.body.map((item, index) => `\n${index + 1}. Title: ${item.title}\nArtist: ${item.artists}`);

      await message.reply(`${list.join("\n\n")}\n\n(Reply with the index of the song to get the lyrics)`, (e,i) => {
        global.GoatBot.onReply.set(i.messageID, {
          messageID: i.messageID,
          threadID: i.threadID,
          author: event.senderID,
          commandName,
          result
        })
      });
      
    } catch (e) {
      console.error(e)
    }
  },
  onReply: async function({Reply,message,event,api}) {
    try {
    if(event.senderID !== Reply.author) {return message.reply("This session is not for you.") }else {
      const index = parseInt(event.body);
      
      if(isNaN(index) || index < 0 || index > Reply.result.body.length) {
      return message.reply("Invalid index. Aborting.");
      }
      const chosen = Reply.result.body[index - 1];
      const {data: imageStream} = await axios.get(chosen.thumbnail, {responseType: "stream"});
      imageStream.path = "thumbnail_" + Reply.author + ".jpg";
      await message.reply({
        attachment: imageStream
      })
      await message.send(chosen.lyrics);
    }
    } catch(e) {
      console.error(e)
      message.reaction("❌", event.messageID)
    }
  }
}