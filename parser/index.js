const { connectDb } = require("../tg/db/index");
const fs = require("fs");
const path = require("path");
const pm2 = require("pm2");

async function runParser() {
  const db = connectDb();
  const collections = await db.getAll();
  await generateConfigs();
  const filepath = path.join(__dirname, "../parser/", "worker.js");
  for (let i = 0; i < collections.length; i++) {
    pm2.start(
      {
        script: filepath,
        name: `worker${i + 1}`,
        env: {
          NODE_APP_INSTANCE: i + 1,
        },
        watch: true,
        ignore_watch: ["../node_modules", "../tg/db"],
      },
      function (err, apps) {
        if (err) {
          console.error(err);
          return pm2.disconnect();
        }
      }
    );
  }
}

async function generateConfigs() {
  const db = connectDb();
  let collections = await db.getAll();
  collections = collections.map((el) => {
    return {
      collection: el,
    };
  });
  for (let i = 0; i < collections.length; i++) {
    const filepath = path.join(
      __dirname,
      "../config/",
      `default-${i + 1}.json`
    );
    await fs.writeFile(filepath, JSON.stringify(collections[i]), (err) => {
      if (err) {
        console.log(err);
      }
    });
    console.log("Config created");
  }
}

async function stopParser() {
  const db = connectDb();
  const collections = await db.getAll();
  for (let i = 0; i < collections.length; i++) {
    pm2.delete(
      `worker${i+1}`,
      function (err, apps) {
        if (err) {
          console.error(err);
          return pm2.disconnect();
        }
      }
    );
  }
}

module.exports = { runParser, stopParser };
