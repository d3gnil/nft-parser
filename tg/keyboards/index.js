const { Keyboard } = require("telegram-keyboard");
const config = require("config");
const { connectDb } = require("../db");
const { Markup } = require("telegraf");

let botConfig = config.util.toObject(config.get("tgBot"));

const runKeyboard = Keyboard.make(["Старт"]);
const stopKeyboard = Keyboard.make(["Стоп"]);
const actionsKeyboard = Keyboard.make(["Коллекции", "Установить кошелек"]);

const mainKeyboard = Keyboard.make(() => {
  if (botConfig.running) {
    return Keyboard.combine(actionsKeyboard, stopKeyboard);
  } else {
    return Keyboard.combine(actionsKeyboard, runKeyboard);
  }
});

const mainCollectionsKeyboard = Keyboard.make([
  ["Список"],
  ['Настроить режим', 'Настроить цену'],
  ["Добавить", "Удалить"],
  ["Назад"],
]);


// const collectionsChoiceKeyboard = Keyboard.make(() => {
//   const db = connectDb();
//   db.getAll().then(res => {
//     let collections = res;
//     let buttons = collections.map((el) => {
//       return el.collectionSlug;
//     });
//     console.log('buttons: ', buttons);
//     const collectionsKeyboard = Keyboard.make(buttons)
//     const cancelKeyboard = Keyboard.make(['Назад'])
//     console.log('collectionsKeyboard: ', collectionsKeyboard);
//     console.log('cancelKeyboard: ', cancelKeyboard)
//     return Keyboard.combine(collectionsKeyboard, cancelKeyboard)
//   });
// });


module.exports = {
  mainKeyboard,
  mainCollectionsKeyboard
};

