const { ObjectId } = require("mongodb");

const { getExpenseCollection } = require("../models/expenseModel");
const { getUserCollection } = require("../models/userModel");

const aiService = require("../services/categoryAI");
const expenseFile = require("../services/expensesFile");

// ✅ ADD EXPENSE
const addExpense = async (req, res) => {
  try {
    const { amount, category, description, note } = req.body;
    const { userId } = req.user;

    const expenses = getExpenseCollection();
    const users = getUserCollection();

    // Insert expense
    await expenses.insertOne({
      amount,
      category,
      description,
      note,
      userId: new ObjectId(userId),
      createdAt: new Date(),
    });

    // 🔥 Increment totalExpense
    await users.updateOne(
      { _id: new ObjectId(userId) },
      { $inc: { totalExpense: Number(amount) } }
    );

    res.status(201).json({ message: "Expense added!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ GET ALL EXPENSES (Pagination)
const getAllExpense = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const { userId } = req.user;

    const expenses = getExpenseCollection();

    const expenseData = await expenses
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalItems = await expenses.countDocuments({
      userId: new ObjectId(userId),
    });

    res.status(200).json({
      expenses: expenseData,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ UPDATE EXPENSE
const updateExpense = async (req, res) => {
  try {
    const { description, amount, id } = req.body;
    const { userId } = req.user;

    if (!description || amount == null || !id) {
      return res.status(400).json({ message: "Missing required inputs" });
    }

    const expenses = getExpenseCollection();
    const users = getUserCollection();

    const oldExpense = await expenses.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

    if (!oldExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const diff = Number(amount) - Number(oldExpense.amount);

    // Update expense
    await expenses.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: { description, amount },
      }
    );

    // 🔥 Update totalExpense difference
    await users.updateOne(
      { _id: new ObjectId(userId) },
      { $inc: { totalExpense: diff } }
    );

    res.status(200).json({ message: "Expense updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ DELETE EXPENSE
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const expenses = getExpenseCollection();
    const users = getUserCollection();

    const expense = await expenses.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // 🔥 Decrement totalExpense
    await users.updateOne(
      { _id: new ObjectId(userId) },
      { $inc: { totalExpense: -Number(expense.amount) } }
    );

    await expenses.deleteOne({ _id: new ObjectId(id) });

    res.status(200).json({ message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ AI CATEGORY
const categoryAI = async (req, res) => {
  try {
    const { description } = req.body;

    const response = await aiService.aiCategory(description);

    res.status(200).json({ category: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ DOWNLOAD EXPENSES
const downloadExpenses = async (req, res) => {
  try {
    const { userId } = req.user;

    const expenses = getExpenseCollection();

    const expenseData = await expenses
      .find(
        { userId: new ObjectId(userId) },
        { projection: { description: 1, amount: 1, category: 1, note: 1 } }
      )
      .toArray();

    const fileUrl = await expenseFile(expenseData, userId);

    res.status(200).json({ download: fileUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addExpense,
  getAllExpense,
  deleteExpense,
  categoryAI,
  downloadExpenses,
  updateExpense,
};