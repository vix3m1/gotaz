const axios = require("axios");

module.exports = {
  config: {
    name: 'xvid',
    category: '18+',
  },
  onStart: async  function({message,api, args,commandName}) {
  const query = args.join(" ");
    if(!query ) return message.reply("No query");
    try {
      const {data: search} = await axios.get(`https://joshweb.click/prn/search/${query}`);
      const list = search.result.map((v,i) => `\n${i + 1}. Title: ${v.title}\nDuration: ${v.duration}`);

      message.reply(list.join("\n\n"), (e,i) => {
        global.GoatBot.onReply.set(i.messageID, {
          messageID: i.messageID,
          threadID: i.threadID,
          commandName,
          result: search.result
        })
      })
    } catch (e) {
      console.error(e)
      return message.reply("an error occurrd")
    }
  },
  onReply: async function({Reply, event, message}) {
    const index = parseInt(event.body) - 1;
    if(isNaN(index) || index > Reply.result.length || index < 0) return message.reply("Invalid index");

    const chosen = Reply.result[index];

    const {data: videoResult} = await axios.get("https://joshweb.click/prn/download?url="+ chosen.video);
    const {data: videoStream} = await axios.get(videoResult.result.contentUrl.Default_Quality, {responseType: 'stream'});

    videoStream.path = Date.now() + ".mp4";

    return message.reply({attachment: videoStream})
  }
}