const { Telegraf } = require("telegraf");
const { staff, collections } = require("./composers/index");
const { connectDb } = require("./db/index");
const {mainKeyboard} = require("./keyboards");

require("dotenv").config();

const collectionsRepo = connectDb();
collectionsRepo.createTable();

const bot = new Telegraf(process.env.TG_API_KEY);

bot.use(staff);
bot.use(collections);
bot.hears('Назад', async (ctx) => {
  await ctx.reply('Возврат назад', mainKeyboard.construct().reply())
})

bot.launch();
