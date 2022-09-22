class CollectionRepository {
  constructor(dao) {
    this.dao = dao;
  }

  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS collections (
      collectionSlug TEXT PRIMARY KEY,
      assetContractAddress TEXT NOT NULL,
      nftPrice INTEGER NOT NULL,
      mode VARCHAR(6) NOT NULL
      )`;
    return this.dao.run(sql);
  }

  create(collection) {
    const { collectionSlug, assetContractAddress, nftPrice, mode } = collection;
    return this.dao.run(
      "INSERT INTO collections (collectionSlug, assetContractAddress, nftPrice, mode) VALUES (?, ?, ?, ?)",
      [collectionSlug, assetContractAddress, nftPrice, mode]
    );
  }

  updateNftPrice(collection) {
    const { collectionSlug, nftPrice } = collection;
    console.log('collection slug: ', collectionSlug, ' nftPrice: ', nftPrice);
    return this.dao.run(
      `UPDATE collections SET nftPrice = ? WHERE collectionSlug = ?`,
      [nftPrice, collectionSlug]
    );
  }

  updateMode(collection) {
    const { collectionSlug, mode } = collection;
    return this.dao.run(
      `UPDATE collections SET mode = ? WHERE collectionSlug = ?`,
      [mode, collectionSlug]
    );
  }

  delete(collectionSlug) {
    return this.dao.run(`DELETE FROM collections WHERE collectionSlug = ?`, [
      collectionSlug,
    ]);
  }

  getByCollectionSlug(collectionSlug) {
    return this.dao.get(`SELECT * FROM collections WHERE collectionSlug = ?`, [
      collectionSlug,
    ]);
  }

  getAll() {
    return this.dao.all(`SELECT * FROM collections`);
  }
}

module.exports = CollectionRepository;
