const { GoatWrapper } = require('fca-liane-utils');
const fs = require("fs-extra");
const axios = require("axios");
const moment = require("moment-timezone");
const os = require('os');
const util = require('util');
const { createCanvas } = require('canvas');
const GIFEncoder = require('gifencoder');

// 🌐 Manila Time
const manilaTime = moment.tz('Asia/Manila');

// 🌀 Spinner Frames
const spinner = [
  '⋘ 𝑃𝑙𝑒𝑎𝑠𝑒 𝑤𝑎𝑖𝑡... ⋙',
  '⋘ 𝑙𝑜𝑎𝑑𝑖𝑛𝑔 𝑑𝑎𝑡𝑎... ⋙',
  '█▒▒▒▒▒▒▒▒▒10%',
  '████▒▒▒▒▒▒30%',
  '█████▒▒▒▒▒50%',
  '████████▒▒80%',
  '██████████100%'
];

module.exports = {
  config: {
    name: "uptimett",
    aliases: ["uptt", "Uptimett", "u", "up"],
    version: "1.8",
    author: "Kylepogi",
    countDown: 5,
    role: 0,
    description: { en: "Bot ping monitor" },
    category: "𝗨𝗽𝘁𝗶𝗺𝗲 𝗥𝗼𝗯𝗼𝘁",
    guide: { en: "{pn}up" }
  },

  onStart: async function ({ message, api, event }) {
    const uptime = process.uptime();
    const formattedUptime = formatMilliseconds(uptime * 1000);

    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const cpu = os.cpus()[0];
    const speed = cpu.speed;
    const totalMem = totalMemory / (1024 ** 3);
    const usedMem = usedMemory / (1024 ** 3);
    const currentTime = manilaTime.format('MMMM D, YYYY h:mm A');
    const serverUptimeString = formatUptime(os.uptime());

    // 🎞️ Create GIF
    const encoder = new GIFEncoder(400, 300);
    const gifPath = './uptime.gif';
    const stream = fs.createWriteStream(gifPath);

    encoder.createReadStream().pipe(stream);
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(1000);
    encoder.setQuality(10);

    const canvas = createCanvas(400, 300);
    const ctx = canvas.getContext('2d');

    const bgColors = ['#ffffff', '#ffcccc', '#ccffcc', '#ccccff'];
    const textColors = ['#000000', '#ff0000', '#00ff00', '#0000ff'];

    for (let i = 0; i < bgColors.length; i++) {
      ctx.fillStyle = bgColors[i];
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = textColors[i];
      ctx.font = '16px impact';
      ctx.fillText('LawkeyandNZR Bot Uptime:', 10, 30);
      ctx.fillText(formattedUptime, 10, 60);
      ctx.fillText('Server Uptime:', 10, 90);
      ctx.fillText(serverUptimeString, 10, 120);
      ctx.fillText('CPU Speed:', 10, 150);
      ctx.fillText(`${speed} MHz`, 10, 180);
      ctx.fillText('Memory Usage:', 10, 210);
      ctx.fillText(`Used: ${usedMem.toFixed(2)} GB / Total: ${totalMem.toFixed(2)} GB`, 10, 240);
      ctx.fillText('Current Time in Manila:', 10, 270);
      ctx.fillText(currentTime, 10, 290);

      encoder.addFrame(ctx);
    }

    encoder.finish();

    // 📶 Bot Ping
    const start = Date.now();
    await axios.get('https://google.com');
    const BotPing = Date.now() - start;

    // 🕒 Spinner Animation
    const loadingMessage = await message.reply(`[📡] 𝗨𝗽𝘁𝗶𝗺𝗲 𝗦𝘆𝘀𝘁𝗲𝗺:\n\n${spinner[0]} Checking uptime, please wait...`);

    let currentFrame = 0;
    const intervalId = setInterval(async () => {
      currentFrame = (currentFrame + 1) % spinner.length;
      try {
        await api.editMessage(
          `[📡] 𝗨𝗽𝘁𝗶𝗺𝗲 𝗦𝘆𝘀𝘁𝗲𝗺:\n\n${spinner[currentFrame]} Checking, please wait...`,
          loadingMessage.messageID
        );
      } catch (err) {
        console.error("Edit message failed:", err.message);
      }
    }, 5000);

    await new Promise(resolve => setTimeout(resolve, 710000)); // 7.1 sec for display
    clearInterval(intervalId);

    try {
      await api.unsendMessage(loadingMessage.messageID);
    } catch (err) {
      console.warn("Failed to unsend spinner message:", err.message);
    }

    // 📤 Send Final Uptime Info
    return message.reply({
      body: `
╭────────────────╮
      𓃵 LawkeyandNZR 𝗕𝗼𝘁 𝗨𝗽𝘁𝗶𝗺𝗲
╰────────────────╯

╭────────────❏
│ ⏳ 𝗨𝗽𝘁𝗶𝗺𝗲: 『${formattedUptime}』
│ 📡 𝗕𝗼𝘁 𝗣𝗶𝗻𝗴: ${BotPing}ms
│ 🖥️ 𝗣𝗹𝗮𝘁𝗳𝗼𝗿𝗺: ${os.platform()}
│ 🛡 𝗢𝗦: ${os.type()} ${os.release()}
│ 📐 𝗔𝗿𝗰𝗵: ${os.arch()}
│ 💾 𝗠𝗲𝗺𝗼𝗿𝘆: ${prettyBytes(process.memoryUsage().rss)}
│ 💽 RAM Usage: ${prettyBytes(usedMemory)} / Total ${prettyBytes(totalMemory)}                            
│ 🧠 𝗖𝗣𝗨: ${cpu.model} (${os.cpus().length} cores)
│ 🌐 𝗦𝗲𝗿𝘃𝗲𝗿 𝗨𝗽𝘁𝗶𝗺𝗲: ${serverUptimeString}                                                
╰────────────────❍`,
      attachment: fs.createReadStream(gifPath)
    }, event.threadID);
  }
};

// 🔄 Wrap command
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });

// 🕒 Format Time Functions
function formatMilliseconds(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return `${days}d ${hours}h ${minutes}m ${sec