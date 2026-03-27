const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

const { getUserCollection } = require("../models/userModel");
const { getForgotCollection } = require("../models/forgotPasswordModel");

const sibEmail = require("../services/sibEmail");

const SALT_ROUNDS = 10;

// ✅ SIGNUP
const n_signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const users = getUserCollection();

    const normalizedEmail = email.toLowerCase().trim();

    // check existing user (replaces UniqueConstraintError)
    const existingUser = await users.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: "Account already exists!" });
    }

    const hashPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await users.insertOne({
      name,
      email: normalizedEmail,
      password: hashPassword,
      isPremium: false,
      totalExpense: 0,
    });

    res
      .status(201)
      .json({ message: `Account created successfully ${normalizedEmail}` });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ LOGIN
const n_login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const users = getUserCollection();

    const normalizedEmail = email.toLowerCase().trim();

    const user = await users.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "User not authorized" });
    }

    const token = jwt.sign(
      { userId: user._id }, // ⚠️ IMPORTANT CHANGE
      process.env.JWT_SECRET
    );

    res.status(200).json({ success: true, token });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ GET USER
const get_user = async (req, res) => {
  try {
    const { userId } = req.user;

    const users = getUserCollection();

    const user = await users.findOne({
      _id: new ObjectId(userId),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      isPremium: user.isPremium,
      name: user.name,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ✅ FORGOT PASSWORD
const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const users = getUserCollection();
    const forgot = getForgotCollection();

    const user = await users.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Account doesnt exist with this email" });
    }

    const { v4: uuidv4 } = require("uuid");

    const token = uuidv4();

    await forgot.insertOne({
      uuid: token,
      userId: user._id,
      isActive: true,
      createdAt: new Date(),
    });

    await sibEmail(email.toLowerCase().trim(), token);

    res.status(200).json({ message: `Email sent to ${email}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { uuid, password } = req.body;

    const users = getUserCollection();
    const forgot = getForgotCollection();

    const request = await forgot.findOne({
      uuid,
      isActive: true,
    });

    if (!request) {
      return res.status(404).json({ message: "Invalid or expired link" });
    }

    const hashPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await users.updateOne(
      { _id: new ObjectId(request.userId) },
      { $set: { password: hashPassword } }
    );

    await forgot.updateOne(
      { uuid },
      { $set: { isActive: false } }
    );

    res.status(200).json({ message: "Password changed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  n_signup,
  n_login,
  get_user,
  forgetPassword,
  resetPassword,
};