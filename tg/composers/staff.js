const { Composer, Markup, Scenes, session } = require("telegraf");
const config = require("config");
const { removeKeyboard } = require("../../utils/constants");
const staff = new Composer();
const { renderConfig } = require("../../utils/renderConfig");
const { runParser, stopParser } = require("../../parser/index");
const {Keyboard} = require("telegram-keyboard");

let botConfig = config.util.toObject(config.get("tgBot"));

staff.hears("Старт", async (ctx) => {
  botConfig.running = true;
  await renderConfig({ tgBot: botConfig });
  await runParser();
  await ctx.reply("Бот запущен", mainKeyboard.construct().reply());
});

staff.hears("Стоп", async (ctx) => {
  botConfig.running = false;
  await renderConfig({ tgBot: botConfig });
  await stopParser();
  await ctx.reply("Бот остановлен", mainKeyboard.construct().reply());
});


staff.start((ctx) => {
  console.log(mainKeyboard.construct());
  ctx.reply('Hi there', mainKeyboard.construct().reply())
  // ctx.reply("Hi there", keyboard.construct().reply());
});


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


// staff.command("run", async (ctx) => {
//   botConfig.running = true;
//   await renderConfig({ tgBot: botConfig });
//   await runParser();
//   await ctx.reply("Бот запущен");
// });
//
// staff.command("stop", async (ctx) => {
//   botConfig.running = false;
//   await renderConfig({ tgBot: botConfig });
//   await stopParser();
//   await ctx.reply("Бот остановлен");
// });

// staff.command("state", async (ctx) => {
//   const reply = botConfig.running ? "запущен" : "остановлен";
//   ctx.reply(`В текущий момент бот ${reply}`);
// });



module.exports = { staff };
