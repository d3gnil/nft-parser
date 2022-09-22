const { Scenes, Telegraf, Markup} = require("telegraf");
const { exitKeyboard, removeKeyboard } = require("../../utils/constants");
const { connectDb } = require("../db");
const {mainCollectionsKeyboard} = require("../keyboards");

const getCollectionHandler = Telegraf.on("message", async (ctx) => {
  const collectionSlug = ctx.message.text;
  ctx.scene.state.collectionSlug = collectionSlug;
  const db = connectDb();
  const collection = await db.getByCollectionSlug(collectionSlug);
  if (collection) {
    ctx.reply(
      `Введите новую цену в ETH для коллекции ${collection.collectionSlug}`, removeKeyboard
    );
    return ctx.wizard.next();
  } else {
    ctx.reply("Коллекция с заданным названием не найдена", mainCollectionsKeyboard.reply());
    return ctx.scene.leave();
  }
});

const updatePriceHandler = Telegraf.on("message", async (ctx) => {
  const price = ctx.message.text;
  const db = connectDb();
  const collection = {
    collectionSlug: ctx.scene.state.collectionSlug,
    nftPrice: price,
  };
  db.updateNftPrice(collection)
    .then((res) => {
      ctx.reply("Цена покупки обновлена", mainCollectionsKeyboard.reply());
    })
    .catch((err) => {
      ctx.reply(`Ошибка: ${err}`, mainCollectionsKeyboard.reply());
    });
  return ctx.scene.leave()
});

const updatePriceScene = new Scenes.WizardScene(
  "updatePriceScene",
  getCollectionHandler,
  updatePriceHandler
);
updatePriceScene.enter(async (ctx) =>
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

module.exports = { updatePriceScene };
