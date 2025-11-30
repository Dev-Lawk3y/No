const g = require("fca-aryan-nix");
const a = require("axios");

const u_pro = "http://65.109.80.126:20409/aryan/gemini-pro";
const u_text = "http://65.109.80.126:20409/aryan/gemini";

module.exports = {
  config: {
    name: "gemini",
    aliases: ["chat"],
    version: "0.0.2",
    author: "ArYAN",//modifié par Christus
    countDown: 3,
    role: 0,
    shortDescription: "💬 Pose ta question à Gemini AI (Texte ou Image)",
    longDescription: "🧠 Discute avec Gemini AI. Réponds à une image pour poser une question dessus.",
    category: "AI",
    guide: "/gemini [ta question] (Répondre à une image pour utiliser la Vision)"
  },

  onStart: async function({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) return api.sendMessage("❌ Veuillez fournir une question ou un texte à envoyer à Gemini.", event.threadID, event.messageID);

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    let imageUrl = null;
    let apiUrl;

    // Vérifie si on répond à une image
    if (event.messageReply && event.messageReply.attachments.length > 0) {
      const attachment = event.messageReply.attachments[0];
      if (['photo', 'sticker', 'animated_image'].includes(attachment.type)) {
        imageUrl = attachment.url;
      }
    } else if (event.attachments.length > 0) {
      const attachment = event.attachments[0];
      if (['photo', 'sticker', 'animated_image'].includes(attachment.type)) {
        imageUrl = attachment.url;
      }
    }

    try {
      // Choisir l'API selon texte ou image
      apiUrl = imageUrl
        ? `${u_pro}?prompt=${encodeURIComponent(prompt)}&url=${encodeURIComponent(imageUrl)}`
        : `${u_text}?prompt=${encodeURIComponent(prompt)}`;

      const res = await a.get(apiUrl);
      const reply = res.data?.response;
      if (!reply) throw new Error("Pas de réponse de l'API Gemini.");

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      api.sendMessage(`💡 Gemini dit :\n\n${reply}`, event.threadID, (err, i) => {
        if (!i) return;
        if (!imageUrl) {
          global.GoatBot.onReply.set(i.messageID, { commandName: this.config.name, author: event.senderID });
        }
      }, event.messageID);

    } catch (e) {
      console.error("Erreur commande Gemini :", e.message);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("⚠ Oups ! Gemini n'a pas pu répondre, réessaye plus tard.", event.threadID, event.messageID);
    }
  },

  onReply: async function({ api, event, Reply }) {
    if ([api.getCurrentUserID()].includes(event.senderID)) return;
    const prompt = event.body;
    if (!prompt) return;

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const res = await a.get(`${u_text}?prompt=${encodeURIComponent(prompt)}`);
      const reply = res.data?.response;
      if (!reply) throw new Error("Pas de réponse de l'API Gemini.");

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      api.sendMessage(`💬 Gemini répond :\n\n${reply}`, event.threadID, (err, i) => {
        if (!i) return;
        global.GoatBot.onReply.set(i.messageID, { commandName: this.config.name, author: event.senderID });
      }, event.messageID);

    } catch (e) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("⚠ Oups ! Impossible d'obtenir une réponse de Gemini pour le moment.", event.threadID, event.messageID);
    }
  }
};

const w = new g.GoatWrapper(module.exports);
w.applyNoPrefix({ allowPrefix: true });
