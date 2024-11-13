const axios = require("axios");

module.exports = {
  config: {
    name: 'random18',
    category: '18+',
  },
  onStart: function({message,event,commandName}) {
  const msg = `This command is intended for users who are 18 years old or older. If you are under 18 years old, I wont encourage you to go further.\n\nReact with "👍" to continue or "👎" to cancel.`;

    message.reply(msg, (e,i) => {
      global.GoatBot.onReaction.set(i.messageID, {
        messageID: i.messageID,
        author: event.senderID,
        commandName,
      })
    })
  },
  onReaction: async function({Reaction, event,message}) {
    if(event.senderID === Reaction.author) {
      switch(event.reaction) {
        case '👍': {
          const {data} = await axios.get("https://hiroshi-api.onrender.com/video/18");

      const {data:vid} = await axios.get(data.mp4Link, {responseType: 'stream'});

      vid.path = Date.now() + ".mp4";

     return message.reply({attachment: vid})
        }
        case '👎': {
          return message.reply("Aborted.");
        }
        default: {
          message.reply("Invalid. Try again.")
        }
        }
      }
      
  }
}