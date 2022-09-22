const { Composer, Markup, Scenes, session } = require("telegraf");
const { setCollectionScene, updatePriceScene, updateModeScene, setWalletScene, deleteCollectionScene } = require("../scenes/index");
const { removeKeyboard } = require("../../utils/constants");
const { connectDb } = require("../db");
const {mainKeyboard, mainCollectionsKeyboard, collectionsChoiceKeyboard} = require("../keyboards");
const collections = new Composer();

const stage = new Scenes.Stage([setCollectionScene, updatePriceScene, updateModeScene, setWalletScene, deleteCollectionScene]);
collections.use(session(), stage.middleware());

setCollectionScene.hears("Отмена", async (ctx) => {
  await ctx.reply("Операция отменена", mainCollectionsKeyboard.reply());
  await ctx.scene.leave();
});
updatePriceScene.hears("Отмена", async (ctx) => {
  await ctx.reply("Операция отменена", mainKeyboard.construct().reply());
  await ctx.scene.leave();
});
updateModeScene.hears("Отмена", async (ctx) => {
  await ctx.reply("Операция отменена", mainKeyboard.construct().reply());
  await ctx.scene.leave();
});
setWalletScene.hears("Отмена", async (ctx) => {
  await ctx.reply("Операция отменена", mainKeyboard.construct().reply());
  await ctx.scene.leave();
});
deleteCollectionScene.hears("Отмена", async (ctx) => {
  await ctx.reply("Операция отменена", mainKeyboard.construct().reply());
  await ctx.scene.leave();
});

collections.hears('Коллекции', async (ctx) => {
  await ctx.reply('Меню коллекций', mainCollectionsKeyboard.reply())
})

collections.hears('Установить кошелек', async (ctx) => {
  await ctx.scene.enter('setWalletScene');
})

collections.hears('Список', async (ctx) => {
  const collectionsRepo = connectDb();
  const collections = await collectionsRepo.getAll();
  let msg = "";
  const lineSeparator = "--------------------------";
  collections.forEach((el) => {
    msg += `<b>Коллекция ${el.collectionSlug}</b>\nВерхняя граница покупки: ${el.nftPrice} ETH\nАдрес коллекции: ${el.assetContractAddress}\nРежим бота: ${el.mode}\n${lineSeparator}\n\n`;
  });
  if (msg === '') {
    await ctx.reply('Коллекций не установлено')
  } else {
    await ctx.reply(msg, { parse_mode: "HTML" });
  }
})

collections.hears("Добавить", async (ctx) => {
  await ctx.scene.enter("setCollectionScene");
});

collections.hears('Настроить цену', async (ctx) => {
  await ctx.scene.enter('updatePriceScene')
})

collections.hears('Настроить режим', async (ctx) => {
  await ctx.scene.enter('updateModeScene')
})

collections.hears('Удалить', async (ctx) => {
  await ctx.scene.enter('deleteCollectionScene');
})

// collections.command("setCollection", async (ctx) => {
//   await ctx.scene.enter("setCollectionScene");
// });

// collections.command("collections", async (ctx) => {
//   const collectionsRepo = connectDb();
//   const collections = await collectionsRepo.getAll();
//   let msg = "";
//   const lineSeparator = "--------------------------";
//   collections.forEach((el) => {
//     msg += `<b>Коллекция ${el.collectionSlug}</b>\nВерхняя граница покупки: ${el.nftPrice} ETH\nАдрес коллекции: ${el.assetContractAddress}\nРежим бота: ${el.mode}\n${lineSeparator}\n\n`;
//   });
//   if (msg === '') {
//     await ctx.reply('Коллекций не установлено')
//   } else {
//     await ctx.reply(msg, { parse_mode: "HTML" });
//   }
// });

// collections.command('updatePrice', async (ctx) => {
//   await ctx.scene.enter('updatePriceScene')
// })

// collections.command('updateMode', async (ctx) => {
//   await ctx.scene.enter('updateModeScene')
// })


// collections.command('setWallet', async (ctx) => {
//   await ctx.scene.enter('setWalletScene');
// })

collections.command('deleteCollection', async (ctx) => {
  await ctx.scene.enter('deleteCollectionScene');
})

module.exports = { collections };
