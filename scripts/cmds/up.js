const os = require("os");

module.exports = {
  config: {
    name: "up",
    aliases: ["upt", "uptime", "rtm"],
    version: "1.9.9",
    author: "Lawkey Marvelous",
    usePrefix: false,
    role: 0,
    shortDescription: { en: "uptime stats" },
    longDescription: {
      en: "uptime information"
    },
    category: "system",
    guide: { en: "{p}uptime" }
  },

  onStart: async function ({ api, event, config, usersData, threadsData }) {
    const delay = ms => new Promise(res => setTimeout(res, ms));
    const loadStages = [
      "🌑 [░░░░░░░░░░░░░░] 0%",
      "🌒 [▓▓▓▓░░░░░░░░░░] 25%",
      "🌓 [▓▓▓▓▓▓▓▓░░░░░░] 50%",
      "🌔 [▓▓▓▓▓▓▓▓▓▓▓▓░░] 75%",
      "🌕 [▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%"
    ];

    try {
      const loading = await api.sendMessage("🚀 Initializing Uptime Statistics...\n" + loadStages[0], event.threadID);

      for (let i = 1; i < loadStages.length; i++) {
        await delay(300);
        await api.editMessage(`🚀 Initializing Uptime Statistics...\n${loadStages[i]}`, loading.messageID, event.threadID);
      }

      const memoryUsage = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
      const totalMemory = (os.totalmem() / 1024 / 1024).toFixed(2);
      const freeMemory = (os.freemem() / 1024 / 1024).toFixed(2);
      const memoryUsagePercent = ((memoryUsage / totalMemory) * 100).toFixed(2);
      const cpuModel = os.cpus()[0].model.split('@')[0].trim();
      const cpuSpeed = (os.cpus()[0].speed / 1000).toFixed(1);
      const cpuCores = os.cpus().length;
      const platform = os.platform();
      const osType = os.type();
      const osRelease = os.release();
      const osArch = os.arch();
      const nodeVersion = process.version;

      const botName = (global.GoatBot && global.GoatBot.config && global.GoatBot.config.nickNameBot) || "MyBot";
      const prefix = (global.GoatBot && global.GoatBot.config && global.GoatBot.config.prefix) || "/";
      const adminName = "Lawkey Marvelous";

      const allUsers = (usersData && typeof usersData.getAll === "function") ? await usersData.getAll() : [];
      const allThreads = (threadsData && typeof threadsData.getAll === "function") ? await threadsData.getAll() : [];

      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      const uptimeFormatted = `${days}d ${hours}h ${minutes}m ${seconds}s`;

      const systemUptime = os.uptime();
      const sysDays = Math.floor(systemUptime / 86400);
      const sysHours = Math.floor((systemUptime % 86400) / 3600);
      const sysMinutes = Math.floor((systemUptime % 3600) / 60);
      const sysUptimeFormatted = `${sysDays}d ${sysHours}h ${sysMinutes}m`;

      const now = new Date();
      const date = now.toLocaleDateString("en-US", {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: "Asia/Dhaka"
      });

      const time = now.toLocaleTimeString("en-US", {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: "Asia/Dhaka"
      });

      const networkInterfaces = os.networkInterfaces();
      let ipAddress = "Not Available";
      for (const interfaceName in networkInterfaces) {
        const interfaces = networkInterfaces[interfaceName];
        for (const iface of interfaces) {
          if (!iface.internal && iface.family === 'IPv4') {
            ipAddress = iface.address;
            break;
          }
        }
      }

      const finalMessage = `
┌────────────────────┐
│ ⚡ ༒︎🝮︎︎☠︎︎𝕃𝕖𝕘𝕖𝕟𝕕☠︎︎🝮︎︎༒ 𝘽𝙊𝙏 𝙐𝙋𝙏𝙄𝙈𝙀 ⚡  │
├────────────────────┤
│ 🤖 Bot: ${botName}    
│ 🗝️ Prefix: ${prefix}     
│ 👑 Admin: ${adminName}  
├────────────────────┤
│ 👥 Members: ${allUsers.length.toLocaleString()}
│ 📂 Groups: ${allThreads.length.toLocaleString()}  
├────────────────────┤
│ ⏳ Uptime: ${uptimeFormatted} 
│ 🖥️ Sys Up: ${sysUptimeFormatted}     
│ 📅 Date: ${date}      
│ 🕓 Time: ${time}      
├────────────────────┤
│ 💽 Mem: ${memoryUsage}MB / ${totalMemory}MB (${memoryUsagePercent}%)  
│ 🆓 Free: ${freeMemory}MB  
│ 🖥 OS: ${platform} ${osArch} ${osRelease} 
│ 📦 Node: ${nodeVersion} 
├────────────────────┤
│ 🛠 CPU: ${cpuModel}   
│ ⚙️ Cores: ${cpuCores} @ ${cpuSpeed}GHz
│ 🌍 IP: ${ipAddress}  
└────────────────────┘
`.trim();

      await delay(500);
      await api.editMessage(finalMessage, loading.messageID, event.threadID);

    } catch (err) {
      console.error("Uptime error:", err);
      await api.sendMessage("❌ An error occurred while fetching uptime statistics. Please try again later.", event.threadID);
    }
  }
};
