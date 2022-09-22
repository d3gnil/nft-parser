const {Markup} = require("telegraf");

const exitKeyboard = Markup.keyboard(['Отмена']).oneTime();
const removeKeyboard = Markup.removeKeyboard();

module.exports = {exitKeyboard, removeKeyboard}