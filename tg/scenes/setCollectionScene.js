const { Scenes, Telegraf } = require("telegraf");
const { exitKeyboard, removeKeyboard } = require("../../utils/constants");
const {mainCollectionsKeyboard} = require("../keyboards");
const sdk = require("api")("@opensea/v1.0#7dtmkl3ojw4vb");

const collectionHandler = Telegraf.on("message", async (ctx) => {
  const collectionAddress = ctx.message.text;
  const collectionSlug = await getSlug(collectionAddress);
  if (collectionSlug === null) {
    await ctx.reply('Ошибка, коллекция не найдена', mainCollectionsKeyboard.reply());
    return ctx.scene.leave()
  }
  await ctx.reply(`Установлена коллекция: ${collectionSlug}`, removeKeyboard);
  await ctx.reply("Введите цену покупки nft в ETH");
  // For timeout in requests
  setTimeout(async () => {
    const collectionInfo = await getCollectionInfo(collectionSlug).catch(
      (err) => {
        console.log("ERROR FROM GET COLLECTION: ", err);
      }
    );
    ctx.scene.state.collectionSlug = collectionSlug;
    ctx.scene.state.assetContractAddress = collectionAddress;
    return ctx.wizard.next();
  }, 1000);
  // For non-timeout
  // const collectionInfo = await getCollectionInfo(collectionSlug).catch(
  //   (err) => {
  //     ctx.reply("Ошибка: ", err);
  //   }
  // );
  // ctx.scene.state.collectionSlug = collectionSlug;
  // ctx.scene.state.collectionInfo = collectionInfo;
  // console.log("from collectionInfo fn: ", collectionInfo);
  // return ctx.wizard.next();
});

const priceHandler = Telegraf.on("message", async (ctx) => {
  const nftPrice = ctx.message.text;
  // console.log('КОЛЛЕКШН ИНФО: ', ctx.scene.state.collectionInfo)
  const collection = {
    collectionSlug: ctx.scene.state.collectionSlug,
    assetContractAddress: ctx.scene.state.assetContractAddress,
    nftPrice: nftPrice,
    mode: "manual",
  };
  const { connectDb } = require("../db/index");
  const collectionsRepo = connectDb();
  collectionsRepo
    .create(collection)
    .then(async () => {
      await ctx.reply("Коллекция добавлена в отслеживаемые", mainCollectionsKeyboard.reply());
    })
    .catch(async () => {
      await ctx.reply("Ошибка при добавлении коллекции", mainCollectionsKeyboard.reply());
    });
  return ctx.scene.leave();
});

const setCollectionScene = new Scenes.WizardScene(
  "setCollectionScene",
  collectionHandler,
  priceHandler
);
setCollectionScene.enter((ctx) =>
  ctx.reply(`Введите адрес коллекции: `, exitKeyboard)
);

async function getSlug(collectionAddress) {
  try {
    const res = await sdk.retrievingASingleContractTestnets({
      asset_contract_address: collectionAddress.toLowerCase(),
    });
    return res.collection.slug;
  } catch {
    return null;
  }
}

async function getCollectionInfo(collectionSlug) {
  const res = await sdk.retrievingASingleCollectionTestnets({
    collection_slug: collectionSlug,
  });
  return res;
}

module.exports = { setCollectionScene };
