const { getDB } = require("../utils/db-connection");

const getUserCollection = () => {
  const db = getDB();
  return db.collection("users");
};

module.exports = { getUserCollection };