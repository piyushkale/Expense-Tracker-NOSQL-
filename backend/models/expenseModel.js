const { getDB } = require("../utils/db-connection");

const getExpenseCollection = () => {
  const db = getDB();
  return db.collection("expenses");
};

module.exports = { getExpenseCollection };