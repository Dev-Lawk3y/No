const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "edit",
    version: "1.0",
    author: "Christus",
    countDown: 5,
    role: 0,
    shortDescription: "Modifier une image via l'API FluxKontext",
    longDescription: "Édite une image uploadée selon votre prompt en utilisant l'API FluxKontext.",
    category: "ai-image-edit",
    guide: "{p}edit [prompt] (répondre à une image)"
  },

  onStart: async function ({ api, event, args, message }) {
    const prompt = args.join(" ");
    const repliedImage = event.messageReply?.attachments?.[0];

    if (!repliedImage || repliedImage.type !== "photo") {
      return message.reply(
        "⚠️ Veuillez répondre à une photo **et** fournir un prompt pour la modifier.\nExemple : /edit Transforme-la en style cartoon"
      );
    }

    if (!prompt) {
      return message.reply(
        "⚠️ Veuillez fournir un prompt pour modifier l'image.\nExemple : /edit Transforme-la en style cartoon"
      );
    }

    const processingMsg = await message.reply("⏳ Traitement de votre image en cours...");

    const imgPath = path.join(__dirname, "cache", `${Date.now()}_edit.jpg`);

    try {
      const imgURL = repliedImage.url;
      const apiURL = `https://dev.oculux.xyz/api/fluxkontext?prompt=${encodeURIComponent(prompt)}&ref=${encodeURIComponent(imgURL)}`;
      
      const res = await axios.get(apiURL, { responseType: "arraybuffer" });

      await fs.ensureDir(path.dirname(imgPath));
      await fs.writeFile(imgPath, Buffer.from(res.data, "binary"));

      await api.unsendMessage(processingMsg.messageID);
      message.reply({
        body: `✅ Image modifiée selon : "${prompt}"`,
        attachment: fs.createReadStream(imgPath)
      });

    } catch (err) {
      console.error("Erreur EDIT :", err);
      await api.unsendMessage(processingMsg.messageID);
      message.reply("❌ Impossible de modifier l'image. Veuillez réessayer plus tard.");
    } finally {
      if (fs.existsSync(imgPath)) {
        await fs.remove(imgPath);
      }
    }
  }
};
