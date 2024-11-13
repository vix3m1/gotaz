const axios = require("axios");


module.exports = {
  config: {
    name: 'pinterest',
    aliases: ['pin'],
    category: 'media',
    author: 'renz'
  },
  onStart: async function({api,args,message}) {
    const input = args.join(" "). split("|");
    const query = input[0];
    if(!query || query.length < 1) return message.reply("Please provided a query. Sample: xpin dog | <NUMBER>")
    const num = parseInt(input[1]) || 5;
    if(num > 10) return message.reply("Number must be less than 10");
    try {
      const {data:{result}} = await axios.get(`https://joshweb.click/api/pinterest?q=${query}`);
      let imgStreams = [];
      for(let i = 0; i < num; i++ ) {
        const {data:imgStream} = await axios.get(result[i], {responseType: 'stream'});
        imgStream.path = `pin_${i}.jpg`
        imgStreams.push(imgStream)
      }
      await message.reply({attachment: imgStreams});

      return;
    } catch (e) {
      console.error(e)
      return message.reply("Error")
    }
  }
}