const { Scenes, Telegraf, Markup} = require("telegraf");
const { exitKeyboard, removeKeyboard } = require("../../utils/constants");
const {connectDb} = require("../db");
const {mainCollectionsKeyboard} = require("../keyboards");
const sdk = require("api")("@opensea/v1.0#7dtmkl3ojw4vb");

const collectionHandler = Telegraf.on("message", async (ctx) => {
  const collectionSlug = ctx.message.text;
  db = connectDb()
  db.delete(collectionSlug)
  await ctx.reply(`Удалена коллекция: ${collectionSlug}`, mainCollectionsKeyboard.reply());
  return ctx.scene.leave();
});

const deleteCollectionScene = new Scenes.WizardScene(
  "deleteCollectionScene",
  collectionHandler
);
deleteCollectionScene.enter(async (ctx) =>
  {
    const db = connectDb();
    let collections = await db.getAll();
    let buttons = collections.map((el) => {
      return el.collectionSlug;
    });
    buttons = resizeArray(buttons);
    buttons.push(["Отмена"]);
    await ctx.reply(`Выберите коллекцию`, Markup.keyboard(buttons));
  }
);

function resizeArray(array) {
  let size = 2;
  let subarray = [];
  for (let i = 0; i < Math.ceil(array.length / size); i++) {
    subarray[i] = array.slice(i * size, i * size + size);
  }
  return subarray;
}

module.exports = { deleteCollectionScene };
