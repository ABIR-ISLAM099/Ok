module.exports.config = {
  name: "bot",
  version: "1.1.0",
  permission: 0,
  credits: "ryuko",
  premium: false,
  description: "talk reply",
  prefix: false,
  category: "without prefix",
  cooldowns: 0
};

const axios = require('axios');

module.exports.onLoad = function() {
  const { writeFileSync, existsSync } = global.nodemodule["fs-extra"];
  const { resolve } = global.nodemodule["path"];
  const log = require('../../main/utility/logs.js');
  const path = resolve(__dirname, 'system', 'system.json');
  if (!existsSync(path)) {
    const obj = {
      ryuko: {}
    };
    writeFileSync(path, JSON.stringify(obj, null, 4));
  } else {
    const data = require(path);
    if (!data.hasOwnProperty('ryuko')) data.ryuko = {};
    writeFileSync(path, JSON.stringify(data, null, 4));
  }
}

module.exports.handleEvent = async ({ api, event, args, Threads }) => {
  const { threadID, messageID } = event;
  const { resolve } = global.nodemodule["path"];
  const path = resolve(__dirname, '../commands', 'system', 'system.json');
  
  const { ryuko } = require(path);
  
  if (ryuko.hasOwnProperty(threadID) && ryuko[threadID] == true) {
    if (event.senderID !== api.getCurrentUserID()) {
      axios.get(encodeURI(`https://joncll.serv00.net/sim/sim.php?query=${event.body}`)).then(res => {
        if (res.data.respond == "null" || res.data.respond == "i didn't understand you, teach me.") {
          api.sendMessage("i didn't understand you, teach me.", threadID, messageID);
        } else {
          return api.sendMessage(res.data.respond, threadID, messageID);
        }
      });
    }
  }
}

module.exports.run = async ({ api, event, args, permission }) => {
  const { writeFileSync } = global.nodemodule["fs-extra"];
  const { resolve } = global.nodemodule["path"];
  const path = resolve(__dirname, 'system', 'system.json');
  const { threadID, messageID } = event;
  const database = require(path);
  
  const { ryuko } = database;
  
  if (!args[0]) {
    return api.sendMessage("Enter a message", threadID, messageID);
  } else {
    switch (args[0].toLowerCase()) {
      case "hello":
        // Respond with a random pre-defined message
        const tl = ["Hum Baby Bolo🐱"];
        const rand = tl[Math.floor(Math.random() * tl.length)];
        return api.sendMessage(rand, threadID, messageID);
        
      default:
        // For other messages, use the API to get a response
        axios.get(encodeURI(`https://joncll.serv00.net/sim/sim.php?query=${args.join(" ")}`)).then(res => {
          if (res.data.respond == "null" || res.data.respond == "i didn't understand you, teach me.") {
            api.sendMessage("I didn't understand you, teach me.", threadID, messageID);
          } else {
            return api.sendMessage(res.data.respond, threadID, messageID);
          }
        });
        break;
    }
    // Save the database after changes (if any)
    writeFileSync(path, JSON.stringify(database, null, 4));
  }
}
