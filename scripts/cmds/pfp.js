const { GoatWrapper } = require("fca-saim-x69x");

module.exports = {
  config: {
    name: "profile",
    aliases: ["pp", "pfp"],
    version: "1.0",
    author: "Saimx69x",
    countDown: 5,
    role: 0,
    shortDescription: "Afficher la photo de profil de l'utilisateur",
    longDescription: "Voir la photo de profil de vous-même, d'un utilisateur tagué, d'un utilisateur répondu ou d'un UID spécifique.",
    category: "image",
    guide: {
      en: "{pn} [@tag | reply | uid] — Afficher la photo de profil"
    }
  },

  onStart: async function ({ event, message, args, usersData }) {
    try {
      let targetID;

      if (event.type === "message_reply") {
        targetID = event.messageReply.senderID;
      } 
      else if (Object.keys(event.mentions)[0]) {
        targetID = Object.keys(event.mentions)[0];
      } 
      else if (args[0] && !isNaN(args[0])) {
        targetID = args[0];
      } 
      else {
        targetID = event.senderID;
      }

      const name = await usersData.getName(targetID).catch(() => "Utilisateur inconnu");
      const avatarURL = await usersData.getAvatarUrl(targetID);

      return message.reply({
        body: `🖼️ 𝑷𝒉𝒐𝒕𝒐 𝒅𝒆 𝒑𝒓𝒐𝒇𝒊𝒍 𝒅𝒆\n✨️ ${name} (${targetID})`,
        attachment: await global.utils.getStreamFromURL(avatarURL)
      });

    } catch (err) {
      console.error(err);
      return message.reply("❌ Impossible de récupérer la photo de profil. Peut-être que l’UID est invalide ou bloqué par la confidentialité.");
    }
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
