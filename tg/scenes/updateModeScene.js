const { Scenes, Telegraf, Markup } = require("telegraf");
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
      `Введите новый режим работы (ручной/автоматический) для коллекции ${collection.collectionSlug}`,
      Markup.keyboard([["Ручной", "Автоматический"], ["Отмена"]])
        .resize()
        .oneTime()
    );
    return ctx.wizard.next();
  } else {
    ctx.reply("Коллекция с заданным названием не найдена", mainCollectionsKeyboard.reply());
    return ctx.scene.leave();
  }
  return ctx.scene.leave();
});

const updateModeHandler = Telegraf.on("message", async (ctx) => {
  let mode = ctx.message.text;
  if (mode === "Ручной") {
    mode = "manual";
  } else if (mode === "Автоматический") {
    mode = "auto";
  }
  if (mode !== "manual" && mode !== "auto") {
    await ctx.reply(
      "Режим работы может быть 'Ручной' или 'Автоматический', повторите ввод"
    );
    return ctx.wizard.selectStep(ctx.wizard.cursor);
  } else {
    const db = connectDb();
    const collection = {
      collectionSlug: ctx.scene.state.collectionSlug,
      mode: mode,
    };
    db.updateMode(collection)
      .then((res) => {
        ctx.reply("Режим обновлен", mainCollectionsKeyboard.reply());
      })
      .catch((err) => {
        ctx.reply(`Ошибка: ${err}`, mainCollectionsKeyboard.reply());
      });
    return ctx.scene.leave();
  }
});

const updateModeScene = new Scenes.WizardScene(
  "updateModeScene",
  getCollectionHandler,
  updateModeHandler
);
updateModeScene.enter(async (ctx) => {
  const db = connectDb();
  let collections = await db.getAll();
  let buttons = collections.map((el) => {
    return el.collectionSlug;
  });
  buttons = resizeArray(buttons);
  buttons.push(["Отмена"]);
  await ctx.reply(`Выберите коллекцию`, Markup.keyboard(buttons));
});

function resizeArray(array) {
  let size = 2;
  let subarray = [];
  for (let i = 0; i < Math.ceil(array.length / size); i++) {
    subarray[i] = array.slice(i * size, i * size + size);
  }
  return subarray;
}

module.exports = { updateModeScene};
