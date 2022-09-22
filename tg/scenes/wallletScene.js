const { Scenes, Telegraf } = require("telegraf");
const { exitKeyboard, removeKeyboard } = require("../../utils/constants");
const {renderConfig} = require("../../utils/renderConfig")
const config = require("config");
let botConfig = config.util.toObject(config.get("tgBot"));

const walletHandler = Telegraf.on("message", async (ctx) => {
  const privateKey = ctx.message.text;
  await ctx.reply("Кошелек установлен", removeKeyboard);
  botConfig.privateKey = privateKey;
  await renderConfig({"tgBot": botConfig});
  return ctx.scene.leave();
});

const setWalletScene = new Scenes.WizardScene(
  "setWalletScene",
  walletHandler
);
setWalletScene.enter((ctx) =>
  ctx.reply(`Введите приватный ключ вашего кошелька: `, exitKeyboard)
);


module.exports = { setWalletScene };
