const axios = require('axios');

const piVoiceModels = {
  1: "Pi 1 ✨",
  2: "Pi 2 ✨",
  3: "Pi 3 ✨",
  4: "Pi 4",
  5: "Pi 5",
  6: "Pi 6",
  7: "Pi 7",
  8: "Pi 8"
};

module.exports = {
  config: {
    name: "pi",
    version: "1.0",
    author: "Christus",
    countDown: 5,
    role: 0,
    description: {
      en: "Discute avec l’IA Pi via texte ou voix. Supporte le choix du modèle et l’activation/désactivation de la voix.",
      vn: "Trò chuyện với Pi AI bằng văn bản hoặc giọng nói. Hỗ trợ chọn mô hình và bật/tắt giọng nói."
    },
    category: "ai",
    guide: {
      en:
        "   {pn} <votre message>" +
        "\n   {pn} setvoice on|off|<1–8>" +
        "\n   {pn} list" +
        "\n\nExemples :" +
        "\n   {pn} Bonjour Pi !" +
        "\n   {pn} setvoice on" +
        "\n   {pn} setvoice 3" +
        "\n   {pn} list",
      vn:
        "   {pn} <tin nhắn của bạn>" +
        "\n   {pn} setvoice on|off|<1–8>" +
        "\n   {pn} list" +
        "\n\nVí dụ:" +
        "\n   {pn} Xin chào Pi!" +
        "\n   {pn} setvoice on" +
        "\n   {pn} setvoice 3" +
        "\n   {pn} list"
    }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const userId = event.senderID;
    const input = args.join(" ").trim();

    if (!input) return message.reply("❌ Fournissez un message ou utilisez `setvoice [on/off/1–8]` ou `list`.");

    let voiceSetting = await usersData.get(userId, "data.pi_voice");
    if (!voiceSetting) {
      voiceSetting = { voice: false, model: 1 };
      await usersData.set(userId, voiceSetting, "data.pi_voice");
    }

    if (input.toLowerCase().startsWith("setvoice")) {
      const cmd = input.split(" ")[1]?.toLowerCase();

      if (!cmd || (!["on", "off"].includes(cmd) && isNaN(cmd))) {
        return message.reply("⚙️ Utilisation : `setvoice on`, `setvoice off`, ou `setvoice [1–8]`");
      }

      if (cmd === "on") {
        voiceSetting.voice = true;
      } else if (cmd === "off") {
        voiceSetting.voice = false;
      } else {
        const modelNum = parseInt(cmd);
        if (!piVoiceModels[modelNum]) {
          return message.reply("⚠️ Numéros de modèles supportés : 1 à 8");
        }
        voiceSetting.voice = true;
        voiceSetting.model = modelNum;
      }

      await usersData.set(userId, voiceSetting, "data.pi_voice");
      return message.reply(`✅ Voix : ${voiceSetting.voice ? "ON" : "OFF"} | Modèle : ${piVoiceModels[voiceSetting.model]}`);
    }

    if (input.toLowerCase() === "list") {
      const usage = await usersData.get(userId, "data.pi_usageCount") || 0;
      const currentModel = piVoiceModels[voiceSetting.model] || `Modèle ${voiceSetting.model}`;
      const modelList = Object.entries(piVoiceModels)
        .map(([id, name]) => `🔢 ${id} = ${name}`).join("\n");

      return message.reply(
        `📊 Infos Pi Voix :\n` +
        `🔊 Voix : ${voiceSetting.voice ? "ON" : "OFF"}\n` +
        `🎙️ Modèle : ${currentModel}\n` +
        `📈 Utilisé : ${usage} fois\n\n` +
        `🗂️ Modèles disponibles :\n${modelList}`
      );
    }

    const session = `pi-${userId}`;

    try {
      const res = await callPi(input, session, voiceSetting.voice, voiceSetting.model);
      const currentCount = await usersData.get(userId, "data.pi_usageCount") || 0;
      await usersData.set(userId, currentCount + 1, "data.pi_usageCount");

      if (!res?.text) return message.reply("❌ Pi n’a pas répondu.");

      const replyPayload = { body: res.text };

      if (voiceSetting.voice && res.audio) replyPayload.attachment = await global.utils.getStreamFromURL(res.audio);

      return message.reply(replyPayload, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          author: userId,
          messageID: info.messageID,
          session
        });
      });

    } catch (err) {
      return message.reply("⚠️ Impossible de contacter Pi : " + err.message);
    }
  },

  onReply: async function ({ message, args, event, Reply, usersData }) {
    const userId = event.senderID;
    if (userId !== Reply.author) return;

    const query = event.body?.trim();
    if (!query) return;

    const voiceSetting = await usersData.get(userId, "data.pi_voice") || { voice: false, model: 1 };
    const session = Reply.session || `pi-${userId}`;

    try {
      const res = await callPi(query, session, voiceSetting.voice, voiceSetting.model);
      const currentCount = await usersData.get(userId, "data.pi_usageCount") || 0;
      await usersData.set(userId, currentCount + 1, "data.pi_usageCount");

      if (!res?.text) return message.reply("❌ Pi n’a pas répondu.");

      global.GoatBot.onReply.delete(Reply.messageID);

      const replyPayload = { body: res.text };

      if (voiceSetting.voice && res.audio) replyPayload.attachment = await global.utils.getStreamFromURL(res.audio);

      return message.reply(replyPayload, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          author: userId,
          messageID: info.messageID,
          session
        });
      });

    } catch (err) {
      return message.reply("⚠️ Impossible de contacter Pi : " + err.message);
    }
  }
};

async function callPi(query, session, voice = false, model = 1) {
  const { data: { public: baseUrl } } = await axios.get("https://raw.githubusercontent.com/Tanvir0999/stuffs/refs/heads/main/raw/addresses.json");
  const { data } = await axios.get(`${baseUrl}/pi?query=${encodeURIComponent(query)}&session=${encodeURIComponent(session)}&voice=${voice}&model=${model}`);
  return data.data;
                           }
