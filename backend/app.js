require("dotenv").config();
const express = require("express");
const path = require("path");

const { connectDB } = require("./utils/db-connection");

const userRoute = require("./routes/userRoute");
const paymentRoute = require("./routes/paymentRoute");
const expenseRoute = require("./routes/expenseRoute");
const premiumRoute = require("./routes/premiumRoute");

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

// Routes
app.use("/user", userRoute);
app.use("/expense", expenseRoute);
app.use("/payment", paymentRoute);
app.use("/premium", premiumRoute);

// Reset Password Route
app.get("/resetPassword/:uuid", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/resetPassword.html"));
});

// 🔥 CONNECT DB FIRST, THEN START SERVER
connectDB()
  .then(() => {
    app.listen(3000, () => {
      console.log("🚀 Server running on port 3000");
    });
  })
  .catch((err) => {
    console.log("❌ Failed to start server:", err.message);
  });