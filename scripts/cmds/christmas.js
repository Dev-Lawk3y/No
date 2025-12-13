const fs = require("fs-extra");
const axios = require("axios");

let t = {};

const name = "christmas-list";

t.config = {
  name: "christmas-list",
  aliases: ["xmas"],
  version: "1.0",
  author: "Kylepogi",
  countDown: 5,
  role: 0,
  shortDescription: "xmas canva",
  longDescription: "christmas-list canva",
  category: "text",
  guide: {
    en: "{pn}"
  }
};

t.onStart = async function({ api, event, args }) {
  const pathImg = __dirname + '/cache/e.png';
  const g = args.join(" ");

  const [list, text1, text2, text3, text4] = g.split(" | ");

  try {
    if (!list ||!text1 ||!text2 ||!text3 ||!text4) {
      return api.sendMessage('Please provide all the required texts separated by " | " only 4 text \n\nExample: christmas-list MGA KUPAL | kyle | ronel | algeinor | mark', event.threadID, event.messageID);
    }
    
    const response = await axios.get(`https://api-canvass.vercel.app/${name}?list=${encodeURIComponent(list)}&text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}&text3=${encodeURIComponent(text3)}&text4=${encodeURIComponent(text4)}`, { responseType: 'arraybuffer' });

    await fs.writeFile(pathImg, response.data);

    return api.sendMessage({ attachment: fs.createReadStream(pathImg) }, event.threadID, () => fs.unlinkSync(pathImg), event.messageID);
  } catch (error) {
    console.error(error);
    return api.sendMessage("API Error", event.threadID, event.messageID);
  }
}

module.exports = t;