const fs = require('fs')
const path = require("path");

async function renderConfig(config) {
  const filepath = path.join(__dirname, "../config/", `default.json`);
  fs.writeFile(filepath, JSON.stringify(config), (err) => {
    if (err) {
      console.log(err);
    }
  });
}

module.exports = { renderConfig };
