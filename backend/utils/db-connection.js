const { MongoClient } = require("mongodb");
require("dotenv").config();

const client = new MongoClient(process.env.MONGO_URI);

let db;

const connectDB = async () => {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    db = client.db(process.env.DB_NAME); // same as your SQL DB name
  } catch (err) {
    console.error("❌ DB Connection Error:", err.message);
    process.exit(1);
  }
};

const getDB = () => db;

module.exports = { connectDB, getDB };