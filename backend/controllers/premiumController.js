const { getUserCollection } = require("../models/userModel");

const getExpenseLeaderboard = async (req, res) => {
  try {
    const users = getUserCollection();

    const leaderboard = await users
      .find({}, { projection: { name: 1, totalExpense: 1 } }) // select fields
      .sort({ totalExpense: -1 }) // DESC sorting
      .toArray();

    res.status(200).json({ leaderboard });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getExpenseLeaderboard };