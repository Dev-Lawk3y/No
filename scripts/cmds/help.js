const { commands, aliases } = global.GoatBot;

// --- Fonction pour transformer un texte en style 𝑨𝒁 ---
function toAZStyle(text) {
  const azMap = {
    A:'𝑨', B:'𝑩', C:'𝑪', D:'𝑫', E:'𝑬', F:'𝑭', G:'𝑮', H:'𝑯', I:'𝑰', J:'𝑱',
    K:'𝑲', L:'𝑳', M:'𝑴', N:'𝑵', O:'𝑶', P:'𝑷', Q:'𝑸', R:'𝑹', S:'𝑺', T:'𝑻',
    U:'𝑼', V:'𝑽', W:'𝑾', X:'𝑿', Y:'𝒀', Z:'𝒁',
    a:'𝒂', b:'𝒃', c:'𝒄', d:'𝒅', e:'𝒆', f:'𝒇', g:'𝒈', h:'𝒉', i:'𝒊', j:'𝒋',
    k:'𝒌', l:'𝒍', m:'𝒎', n:'𝒏', o:'𝒐', p:'𝒑', q:'𝒒', r:'𝒓', s:'𝒔', t:'𝒕',
    u:'𝒖', v:'𝒗', w:'𝒘', x:'𝒙', y:'𝒚', z:'𝒛',
    '0':'0','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9',
    ' ':' '
  };
  return text.split('').map(c => azMap[c] || c).join('');
}

module.exports = {
  config: {
    name: "help",
    version: "5.2",
    author: "Christus",
    countDown: 2,
    role: 0,
    shortDescription: { en: "𝐸𝑥𝑝𝑙𝑜𝑟𝑒 𝑎𝑙𝑙 𝑏𝑜𝑡 𝑐𝑜𝑚𝑚𝑎𝑛𝑑𝑠" },
    category: "info",
    guide: { en: "help <command> — 𝐠𝐞𝐭 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐢𝐧𝐟𝐨, -ai 𝐟𝐨𝐫 𝐬𝐦𝐚𝐫𝐭 𝐬𝐮𝐠𝐠𝐞𝐬𝐭𝐢𝐨𝐧𝐬" },
  },

  onStart: async function ({ message, args, event, usersData }) {
    try {
      const uid = event.senderID;
      let avatar = await usersData.getAvatarUrl(uid).catch(() => null);
      if (!avatar) avatar = "https://i.imgur.com/TPHk4Qu.png";

      const autoDelete = async (msgID, delay = 15000) => {
        const countdown = [10,5,3,2,1];
        countdown.forEach((s) => {
          setTimeout(() => {
            message.edit(msgID, `⏳ 𝐒𝐮𝐩𝐩𝐫𝐞𝐬𝐬𝐢𝐨𝐧 𝐝𝐚𝐧𝐬 ${s}s...`);
          }, delay - s*1000);
        });
        setTimeout(async () => {
          try { await message.unsend(msgID); } 
          catch (err) { console.error("❌ 𝐇𝐞𝐥𝐩 𝐝𝐞𝐥𝐞𝐭𝐞 𝐞𝐫𝐫𝐨𝐫:", err.message); }
        }, delay);
      };

      // --- AI Suggestion ---
      if(args[0]?.toLowerCase() === "-ai") {
        const keyword = args[1]?.toLowerCase() || "";
        const allCmds = Array.from(commands.keys());
        const suggestions = allCmds
          .map(cmd => ({ cmd, match: Math.max(40, 100 - Math.abs(cmd.length - keyword.length) * 10) }))
          .filter(c => c.cmd.includes(keyword))
          .sort((a,b)=>b.match - a.match)
          .slice(0,10);

        if(!suggestions.length) {
          const res = await message.reply({ body:"❌ 𝐍𝐨 𝐬𝐮𝐠𝐠𝐞𝐬𝐭𝐢𝐨𝐧𝐬 𝐟𝐨𝐮𝐧𝐝.", attachment: await global.utils.getStreamFromURL(avatar)});
          return autoDelete(res.messageID);
        }

        const body = [
          "🤖 𝐀𝐈 𝐒𝐮𝐠𝐠𝐞𝐬𝐭𝐢𝐨𝐧𝐬:",
          ...suggestions.map(s=>`• ${toAZStyle(s.cmd)} (${s.match}% 𝐦𝐚𝐭𝐜𝐡)`)
        ].join("\n");

        const res = await message.reply({ body, attachment: await global.utils.getStreamFromURL(avatar) });
        return autoDelete(res.messageID);
      }

      // --- Command List ---
      if(!args || args.length === 0) {
        let body = "📚 ༒︎🝮︎︎☠︎︎𝕃𝕖𝕘𝕖𝕟𝕕☠︎︎🝮︎︎༒ 𝐶𝑂𝑀𝑀𝐴𝑁𝐷𝑆\n\n";
        const categories = {};
        for(let [name, cmd] of commands) {
          const cat = cmd.config.category || "Misc";
          if(!categories[cat]) categories[cat] = [];
          categories[cat].push(name);
        }

        for(const cat of Object.keys(categories).sort()) {
          const list = categories[cat].sort().map(c=>`• ${toAZStyle(c)}`).join("  ");
          body += `😑 ${cat}\n${list || "𝐍𝐨 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬"}\n\n`;
        }

        body += `📊 𝐓𝐨𝐭𝐚𝐥 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬: ${commands.size}\n`;
        body += `🔧 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐈𝐧𝐟𝐨: .help <command>\n`;
        body += `🔍 𝐒𝐞𝐚𝐫𝐜𝐡: .help -s <keyword>\n`;
        body += `🤖 𝐀𝐈 𝐒𝐮𝐠𝐠𝐞𝐬𝐭: .help -ai <command>\n`;

        const res = await message.reply({ body, attachment: await global.utils.getStreamFromURL(avatar)});
        return autoDelete(res.messageID);
      }

      // --- Command Info ---
      const query = args[0].toLowerCase();
      const command = commands.get(query) || commands.get(aliases.get(query));
      if(!command) {
        const res = await message.reply({ body:`❌ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 "${query}" 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝.`, attachment: await global.utils.getStreamFromURL(avatar)});
        return autoDelete(res.messageID);
      }

      const cfg = command.config || {};
      const roleMap = {0:"𝐀𝐥𝐥 𝐔𝐬𝐞𝐫𝐬",1:"𝐆𝐫𝐨𝐮𝐩 𝐀𝐝𝐦𝐢𝐧𝐬",2:"𝐁𝐨𝐭 𝐀𝐝𝐦𝐢𝐧𝐬"};
      const aliasesList = Array.isArray(cfg.aliases) && cfg.aliases.length ? cfg.aliases.map(a=>toAZStyle(a)).join(", ") : "𝐍𝐨𝐧𝐞";
      const desc = cfg.longDescription?.en || cfg.shortDescription?.en || "𝐍𝐨 𝐝𝐞𝐬𝐜𝐫𝐢𝐩𝐭𝐢𝐨𝐧.";
      const usage = cfg.guide?.en || cfg.name;

      const card = [
        `✨ ${toAZStyle(cfg.name)} ✨`,
        `📝 𝐃𝐞𝐬𝐜𝐫𝐢𝐩𝐭𝐢𝐨𝐧: ${desc}`,
        `📂 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐲: ${cfg.category || "Misc"}`,
        `🔤 𝐀𝐥𝐢𝐚𝐬𝐞𝐬: ${aliasesList}`,
        `🛡️ 𝐑𝐨𝐥𝐞: ${roleMap[cfg.role] || "Unknown"} | ⏱️ 𝐂𝐨𝐨𝐥𝐝𝐨𝐰𝐧: ${cfg.countDown || 1}s`,
        `🚀 𝐕𝐞𝐫𝐬𝐢𝐨𝐧: ${cfg.version || "1.0"} | 👨‍💻 𝐀𝐮𝐭𝐡𝐨𝐫: ${cfg.author || "Unknown"}`,
        `💡 𝐔𝐬𝐚𝐠𝐞: .${toAZStyle(usage)}`,
        `🔧 𝐎𝐩𝐭𝐢𝐨𝐧𝐬: .help ${toAZStyle(cfg.name.toLowerCase())} [-u | -i | -a]`
      ].join("\n");

      const res = await message.reply({ body: card, attachment: await global.utils.getStreamFromURL(avatar)});
      return autoDelete(res.messageID);

    } catch(err) {
      console.error("HELP CMD ERROR:", err);
      await message.reply(`⚠️ 𝐄𝐫𝐫𝐨𝐫: ${err.message || err}`);
    }
  }
};
