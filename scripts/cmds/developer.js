const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
  config: {
    name: "developer",
    aliases: ["dev"],
    version: "1.0",
    author: "NTKhang | Christus",
    role: 0,
    description: {
      fr: "Ajouter, supprimer ou lister les utilisateurs avec rôle développeur"
    },
    category: "développeur",
    guide: {
      fr: '   {pn} [add | -a] <uid | @tag> : Ajouter un développeur\n'
        + '   {pn} [remove | -r] <uid | @tag> : Supprimer un développeur\n'
        + '   {pn} [list | -l] : Lister tous les développeurs'
    }
  },

  langs: {
    fr: {
      added: "✅ | Rôle développeur ajouté pour %1 utilisateurs :\n%2",
      alreadyDev: "⚠️ | %1 utilisateurs sont déjà développeurs :\n%2",
      missingIdAdd: "⚠️ | Veuillez entrer l'ID ou mentionner un utilisateur pour ajouter un développeur",
      removed: "✅ | Rôle développeur retiré pour %1 utilisateurs :\n%2",
      notDev: "⚠️ | %1 utilisateurs ne sont pas développeurs :\n%2",
      missingIdRemove: "⚠️ | Veuillez entrer l'ID ou mentionner un utilisateur pour retirer un développeur",
      listDev: "👨‍💻 | Liste des développeurs :\n%1"
    }
  },

  onStart: async function ({ message, args, usersData, event, getLang, role }) {
    
    if (!config.developer) config.developer = [];

    switch (args[0]) {
      case "add":
      case "-a": {
        if (role < 4) return message.reply("⚠️ | Seuls les développeurs principaux peuvent ajouter de nouveaux développeurs.");

        if (args[1]) {
          let uids = [];
          if (Object.keys(event.mentions).length > 0)
            uids = Object.keys(event.mentions);
          else if (event.messageReply)
            uids.push(event.messageReply.senderID);
          else
            uids = args.filter(arg => !isNaN(arg));

          const notDevIds = [];
          const devIds = [];
          for (const uid of uids) {
            if (config.developer.includes(uid))
              devIds.push(uid);
            else
              notDevIds.push(uid);
          }

          config.developer.push(...notDevIds);
          const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
          writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
          return message.reply(
            (notDevIds.length > 0 ? getLang("added", notDevIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
            + (devIds.length > 0 ? getLang("alreadyDev", devIds.length, devIds.map(uid => `• ${uid}`).join("\n")) : "")
          );
        }
        else
          return message.reply(getLang("missingIdAdd"));
      }

      case "remove":
      case "-r": {
        if (role < 4) return message.reply("⚠️ | Seuls les développeurs principaux peuvent retirer des développeurs.");

        if (args[1]) {
          let uids = [];
          if (Object.keys(event.mentions).length > 0)
            uids = Object.keys(event.mentions);
          else
            uids = args.filter(arg => !isNaN(arg));

          const notDevIds = [];
          const devIds = [];
          for (const uid of uids) {
            if (config.developer.includes(uid))
              devIds.push(uid);
            else
              notDevIds.push(uid);
          }

          for (const uid of devIds)
            config.developer.splice(config.developer.indexOf(uid), 1);

          const getNames = await Promise.all(devIds.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
          writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
          return message.reply(
            (devIds.length > 0 ? getLang("removed", devIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
            + (notDevIds.length > 0 ? getLang("notDev", notDevIds.length, notDevIds.map(uid => `• ${uid}`).join("\n")) : "")
          );
        }
        else
          return message.reply(getLang("missingIdRemove"));
      }

      case "list":
      case "-l": {
        if (config.developer.length === 0)
          return message.reply("⚠️ | Aucun développeur trouvé");
        const getNames = await Promise.all(config.developer.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
        return message.reply(getLang("listDev", getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")));
      }

      default:
        return message.SyntaxError();
    }
  }
};
