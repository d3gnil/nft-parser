const AppDao = require("./dao");
const CollectionRepository = require("./collectionRepository");

const connectDb = function () {
  const dao = new AppDao('./tg/db/nftParser.db');
  return new CollectionRepository(dao)
}

module.exports = {connectDb}