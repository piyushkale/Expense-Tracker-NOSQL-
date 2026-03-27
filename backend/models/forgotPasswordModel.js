const { getDB } = require("../utils/db-connection");

const getForgotCollection = () => {
  const db = getDB();
  return db.collection("forgotPasswords");
};

module.exports = { getForgotCollection };