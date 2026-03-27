const { getDB } = require("../utils/db-connection");

const getOrderCollection = () => {
  const db = getDB();
  return db.collection("orders");
};

module.exports = { getOrderCollection };